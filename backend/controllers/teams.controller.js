const Team = require("../models/Team");
const Player = require("../models/Player");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET /api/teams?sport=Volleyball
exports.getAllTeams = asyncHandler(async (req, res) => {
  const { sport } = req.query;
  const filter = {};
  if (sport) filter.sport = sport;

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

  const teams = await Team.find(filter)
    .populate("captain", "name profileImageUrl")
    .sort({ name: 1 });

  sendSuccess(res, 200, "Teams retrieved successfully", teams);
});

// GET /api/teams/:id
exports.getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate("captain", "name profileImageUrl");
  if (!team) return sendError(res, 404, "Team not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === team.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${team.sport}.`);
  }

  sendSuccess(res, 200, "Team retrieved successfully", team);
});

// POST /api/teams
exports.createTeam = asyncHandler(async (req, res) => {
  const { name, sport, color } = req.body;
  if (!name || !sport) {
    return sendError(res, 400, "Name and sport are required.");
  }

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${sport}.`);
  }

  // Check uniqueness
  const existing = await Team.findOne({ name, sport });
  if (existing) {
    return sendError(res, 400, "A team with this name already exists in this sport.");
  }

  const teamData = { name, sport, color: color || "#0B1C4A" };

  if (req.file) {
    teamData.logoUrl = req.file.path;
    teamData.logoPublicId = req.file.filename;
  }

  const team = await Team.create(teamData);
  sendSuccess(res, 201, "Team created successfully", team);
});

// PUT /api/teams/:id
exports.updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 404, "Team not found.");

  const { name, sport, captain, color } = req.body;

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasOldPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === team.sport.toLowerCase());
    if (!hasOldPerm) return sendError(res, 403, `Access denied. No permission for sport: ${team.sport}.`);
    if (sport) {
      const hasNewPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === sport.toLowerCase());
      if (!hasNewPerm) return sendError(res, 403, `Access denied. No permission for sport: ${sport}.`);
    }
  }

  // Check unique name if name is changed
  if (name && name !== team.name) {
    const existing = await Team.findOne({ name, sport: sport || team.sport });
    if (existing && String(existing._id) !== String(team._id)) {
      return sendError(res, 400, "A team with this name already exists in this sport.");
    }
    
    // Auto-update all players' cached team string
    await Player.updateMany({ teamRef: team._id }, { team: name });
    team.name = name;
  }

  if (sport !== undefined) team.sport = sport;
  if (color !== undefined) team.color = color;

  if (captain !== undefined) {
    // If captain is set, verify that the player belongs to this team
    if (captain === "") {
      team.captain = null;
    } else {
      const player = await Player.findById(captain);
      if (!player) return sendError(res, 404, "Captain player not found.");
      if (String(player.teamRef) !== String(team._id)) {
        return sendError(res, 400, "Captain must be a member of the team roster.");
      }
      team.captain = captain;
    }
  }

  if (req.file) {
    if (team.logoPublicId) {
      await cloudinary.uploader.destroy(team.logoPublicId);
    }
    team.logoUrl = req.file.path;
    team.logoPublicId = req.file.filename;
  }

  await team.save();
  const updatedTeam = await Team.findById(team._id).populate("captain", "name profileImageUrl");
  sendSuccess(res, 200, "Team updated successfully", updatedTeam);
});

// DELETE /api/teams/:id
exports.deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 404, "Team not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === team.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${team.sport}.`);
  }

  // Delete logo if exists
  if (team.logoPublicId) {
    await cloudinary.uploader.destroy(team.logoPublicId);
  }

  // Remove players from this team
  await Player.updateMany({ teamRef: team._id }, { teamRef: null, team: "" });

  await Team.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Team deleted successfully.");
});

// GET /api/teams/:id/roster
exports.getRoster = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 404, "Team not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === team.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${team.sport}.`);
  }

  const players = await Player.find({ teamRef: req.params.id, isActive: true }).sort({ name: 1 });
  sendSuccess(res, 200, "Team roster retrieved.", players);
});

// POST /api/teams/:id/players
// Add/Transfer a player to this team
exports.addPlayerToTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 404, "Team not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === team.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${team.sport}.`);
  }

  const { playerId } = req.body;
  if (!playerId) return sendError(res, 400, "Player ID is required.");

  const player = await Player.findById(playerId);
  if (!player) return sendError(res, 404, "Player not found.");

  // Verify sports match
  if (player.sport !== team.sport) {
    return sendError(res, 400, "Player sport does not match team sport.");
  }

  // If player was captain of another team, unset that captaincy
  if (player.teamRef && String(player.teamRef) !== String(team._id)) {
    await Team.updateOne({ captain: player._id }, { captain: null });
  }

  player.teamRef = team._id;
  player.team = team.name;
  await player.save();

  sendSuccess(res, 200, "Player added to team successfully.", player);
});

// DELETE /api/teams/:id/players/:playerId
// Remove a player from the team
exports.removePlayerFromTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return sendError(res, 404, "Team not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === team.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${team.sport}.`);
  }

  const player = await Player.findById(req.params.playerId);
  if (!player) return sendError(res, 404, "Player not found.");

  // Unset captaincy if they were captain of the team
  await Team.updateOne({ _id: req.params.id, captain: player._id }, { captain: null });

  player.teamRef = null;
  player.team = "";
  await player.save();

  sendSuccess(res, 200, "Player removed from team successfully.", player);
});
