const Player = require("../models/Player");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError, sendPaginated } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/players?sport=Badminton&page=1&limit=20&search=name
exports.getAllPlayers = asyncHandler(async (req, res) => {
  const { sport, page = 1, limit = 50, search, active } = req.query;

  const filter = {};
  if (sport) filter.sport = sport;
  if (active !== undefined) filter.isActive = active === "true";
  if (search) filter.$text = { $search: search };

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

  const total = await Player.countDocuments(filter);
  const players = await Player.find(filter)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  sendPaginated(res, players, page, limit, total);
});

// GET /api/players/:id
exports.getPlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) return sendError(res, 404, "Player not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === player.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${player.sport}.`);
  }

  sendSuccess(res, 200, "Player retrieved.", player);
});

// POST /api/players
exports.createPlayer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { name, age, sport, team } = req.body;

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${sport}.`);
  }

  const playerData = { name, age, sport, team };

  if (req.file) {
    playerData.profileImageUrl = req.file.path;
    playerData.profileImagePublicId = req.file.filename;
  }

  const player = await Player.create(playerData);
  sendSuccess(res, 201, "Player registered.", player);
});

// PUT /api/players/:id
exports.updatePlayer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const player = await Player.findById(req.params.id);
  if (!player) return sendError(res, 404, "Player not found.");

  const { name, age, sport, team, isActive } = req.body;

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasOldPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === player.sport.toLowerCase());
    if (!hasOldPerm) return sendError(res, 403, `Access denied. No permission for sport: ${player.sport}.`);
    if (sport) {
      const hasNewPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === sport.toLowerCase());
      if (!hasNewPerm) return sendError(res, 403, `Access denied. No permission for sport: ${sport}.`);
    }
  }

  if (name !== undefined) player.name = name;
  if (age !== undefined) player.age = age;
  if (sport !== undefined) player.sport = sport;
  if (team !== undefined) player.team = team;
  if (isActive !== undefined) player.isActive = isActive;

  if (req.file) {
    if (player.profileImagePublicId) {
      await cloudinary.uploader.destroy(player.profileImagePublicId);
    }
    player.profileImageUrl = req.file.path;
    player.profileImagePublicId = req.file.filename;
  }

  await player.save();
  sendSuccess(res, 200, "Player updated.", player);
});

// DELETE /api/players/:id
exports.deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) return sendError(res, 404, "Player not found.");

  if (req.admin && req.admin.role === "admin") {
    if (req.admin.status !== "approved") {
      return sendError(res, 403, "Access denied. Your account is pending or suspended.");
    }
    const hasPerm = req.admin.sportsPermissions.some(s => s.toLowerCase() === player.sport.toLowerCase());
    if (!hasPerm) return sendError(res, 403, `Access denied. No permission for sport: ${player.sport}.`);
  }

  if (player.profileImagePublicId) {
    await cloudinary.uploader.destroy(player.profileImagePublicId);
  }

  await Player.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Player deleted.");
});
