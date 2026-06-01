const Game = require("../models/Game");
const Match = require("../models/Match");
const PointsEntry = require("../models/PointsEntry");
const Player = require("../models/Player");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/games
exports.getAllGames = asyncHandler(async (req, res) => {
  const games = await Game.find().sort({ order: 1, createdAt: 1 });
  sendSuccess(res, 200, "Games retrieved successfully", games);
});

// GET /api/games/:id
exports.getGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return sendError(res, 404, "Game not found.");
  sendSuccess(res, 200, "Game retrieved successfully", game);
});

// GET /api/games/:id/details
// Fetches game along with matches, rankings (PointsEntry), and players in a single API call
exports.getGameDetails = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return sendError(res, 404, "Game not found.");

  // Fetch matches, points entries, and players matching the game name
  const [matches, pointsTable, players] = await Promise.all([
    Match.find({ sport: game.name }).sort({ date: -1 }),
    PointsEntry.find({ sport: game.name }).sort({ rank: 1, points: -1 }),
    Player.find({ sport: game.name, isActive: true }).sort({ name: 1 }),
  ]);

  sendSuccess(res, 200, "Game details retrieved successfully", {
    game,
    matches,
    pointsTable,
    players,
  });
});

// POST /api/games (Admin only)
exports.createGame = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const { name, description, status, iconName, order } = req.body;
  
  // Check unique name
  const existing = await Game.findOne({ name });
  if (existing) {
    return sendError(res, 400, "A game with this name already exists.");
  }

  const gameData = { name, description, status, iconName, order };

  if (req.file) {
    gameData.imageSrc = req.file.path;
    gameData.imagePublicId = req.file.filename;
  }

  const game = await Game.create(gameData);
  sendSuccess(res, 201, "Game created successfully", game);
});

// PUT /api/games/:id (Admin only)
exports.updateGame = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const game = await Game.findById(req.params.id);
  if (!game) return sendError(res, 404, "Game not found.");

  const { name, description, status, iconName, order } = req.body;

  // Check uniqueness if name is changed
  if (name && name !== game.name) {
    const existing = await Game.findOne({ name });
    if (existing) {
      return sendError(res, 400, "A game with this name already exists.");
    }
    game.name = name;
  }

  if (description !== undefined) game.description = description;
  if (status !== undefined) game.status = status;
  if (iconName !== undefined) game.iconName = iconName;
  if (order !== undefined) game.order = order;

  if (req.file) {
    if (game.imagePublicId) {
      await cloudinary.uploader.destroy(game.imagePublicId);
    }
    game.imageSrc = req.file.path;
    game.imagePublicId = req.file.filename;
  }

  await game.save();
  sendSuccess(res, 200, "Game updated successfully", game);
});

// DELETE /api/games/:id (Admin only)
exports.deleteGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return sendError(res, 404, "Game not found.");

  if (game.imagePublicId) {
    await cloudinary.uploader.destroy(game.imagePublicId);
  }

  await Game.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Game deleted successfully.");
});
