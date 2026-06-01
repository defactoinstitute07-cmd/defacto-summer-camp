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
  sendSuccess(res, 200, "Player retrieved.", player);
});

// POST /api/players
exports.createPlayer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { name, age, sport, team } = req.body;
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

  if (player.profileImagePublicId) {
    await cloudinary.uploader.destroy(player.profileImagePublicId);
  }

  await Player.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Player deleted.");
});
