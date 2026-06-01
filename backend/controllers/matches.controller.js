const Match = require("../models/Match");
const Team = require("../models/Team");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");
const matchCache = require("../config/cache");

const sortMatches = (list) => {
  const getRank = (status) => {
    if (status === "upcoming") return 1;
    if (status === "live" || status === "paused") return 2;
    if (status === "completed") return 3;
    return 4;
  };
  return [...list].sort((a, b) => {
    const rA = getRank(a.status);
    const rB = getRank(b.status);
    if (rA !== rB) return rA - rB;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

// GET /api/matches?sport=Badminton&status=live
exports.getAllMatches = asyncHandler(async (req, res) => {
  const { sport, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (sport) filter.sport = sport;
  if (status) filter.status = status;

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    if (sport) {
      const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === sport.toLowerCase());
      if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${sport}.`);
    } else {
      filter.sport = { $in: req.admin.sportsPermissions };
    }
  }

  const total = await Match.countDocuments(filter);
  const rawMatches = await Match.find(filter);
  const sortedMatches = sortMatches(rawMatches);
  const matches = sortedMatches.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    success: true,
    data: matches,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

// GET /api/matches/live
exports.getLiveMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({ status: { $in: ["live", "paused"] } });
  const sorted = sortMatches(matches);
  sendSuccess(res, 200, "Live matches.", sorted);
});

// GET /api/matches/:id
exports.getMatch = asyncHandler(async (req, res) => {
  const matchId = req.params.id;
  const cacheKey = `match:${matchId}`;

  // Check cache first
  const cachedMatch = matchCache.get(cacheKey);
  if (cachedMatch) {
    if (req.admin && req.admin.role === "admin") {
      if (req.admin.status !== "approved") {
        return sendError(res, 403, "Access denied. Your account is pending or suspended.");
      }
      const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === cachedMatch.match.sport.toLowerCase());
      if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${cachedMatch.match.sport}.`);
    }
    return sendSuccess(res, 200, "Match retrieved (cached).", cachedMatch);
  }

  const match = await Match.findById(matchId);
  if (!match) return sendError(res, 404, "Match not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === match.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${match.sport}.`);
  }

  // Resolve team logos and colors
  const teamAData = await Team.findOne({ name: match.teamA, sport: match.sport });
  const teamBData = await Team.findOne({ name: match.teamB, sport: match.sport });

  const payload = {
    match,
    teamALogo: teamAData ? teamAData.logoUrl : "",
    teamBLogo: teamBData ? teamBData.logoUrl : "",
    teamAColor: teamAData ? (teamAData.color || "#0B1C4A") : "#0B1C4A",
    teamBColor: teamBData ? (teamBData.color || "#0B1C4A") : "#0B1C4A",
  };

  // Cache match details with 5-second TTL
  matchCache.set(cacheKey, payload);

  sendSuccess(res, 200, "Match retrieved.", payload);
});

// GET /api/matches/:id/score
exports.getMatchScore = asyncHandler(async (req, res) => {
  const matchId = req.params.id;
  const cacheKey = `score:${matchId}`;

  // Check cache first
  const cachedScore = matchCache.get(cacheKey);
  if (cachedScore) {
    return sendSuccess(res, 200, "Match score retrieved (cached).", cachedScore);
  }

  const match = await Match.findById(matchId);
  if (!match) return sendError(res, 404, "Match not found.");

  const payload = {
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    status: match.status,
    winner: match.winner,
    sets: match.sets || [],
    timeline: match.timeline || []
  };

  // Cache score details with 2-second TTL
  matchCache.set(cacheKey, payload, 2);

  sendSuccess(res, 200, "Match score retrieved.", payload);
});

// POST /api/matches
exports.createMatch = asyncHandler(async (req, res) => {
  if (req.admin.role !== "superadmin") {
    return sendError(res, 403, "Access denied. Only Super Admins can create matches.");
  }

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const match = await Match.create(req.body);
  sendSuccess(res, 201, "Match created.", match);
});

// PUT /api/matches/:id
exports.updateMatch = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const match = await Match.findById(req.params.id);
  if (!match) return sendError(res, 404, "Match not found.");

  // Role and status verification
  if (req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending approval or suspended.");
    }
    const hasPermission = req.admin.sportsPermissions.some(
      (s) => s.toLowerCase() === match.sport.toLowerCase()
    );
    if (!hasPermission) {
      return sendError(res, 403, `Access denied. You do not have permissions to manage scores for ${match.sport}.`);
    }
    if (req.body.sport && req.body.sport.toLowerCase() !== match.sport.toLowerCase()) {
      return sendError(res, 403, "Access denied. You cannot modify the sport type of a match.");
    }
  } else if (req.admin.role !== "superadmin") {
    return sendError(res, 403, "Access denied.");
  }

  const fields = ["sport", "teamA", "teamB", "scoreA", "scoreB", "date", "round", "status", "winner", "notes", "sets", "timeline", "maxPoints"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) match[f] = req.body[f];
  });

  await match.save();

  // Invalidate caches
  matchCache.del(`match:${match._id}`);
  matchCache.del(`score:${match._id}`);

  // Broadcast Socket.IO update
  const io = req.app.get("io");
  if (io) {
    // Broadcast fast score update to match room
    io.to(`match:${match._id}`).emit("scoreUpdate", {
      matchId: match._id,
      score: {
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        status: match.status,
        winner: match.winner,
        sets: match.sets,
        timeline: match.timeline
      },
      timestamp: Date.now()
    });

    io.to(`match_${match._id}`).emit("matchUpdated", match);
    io.emit("scoreUpdated", match);
  }

  sendSuccess(res, 200, "Match updated.", match);
});

// DELETE /api/matches/:id
exports.deleteMatch = asyncHandler(async (req, res) => {
  if (req.admin.role !== "superadmin") {
    return sendError(res, 403, "Access denied. Only Super Admins can delete matches.");
  }

  const match = await Match.findByIdAndDelete(req.params.id);
  if (!match) return sendError(res, 404, "Match not found.");

  // Clear caches
  matchCache.del(`match:${match._id}`);
  matchCache.del(`score:${match._id}`);

  sendSuccess(res, 200, "Match deleted.");
});
