const Match = require("../models/Match");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/matches?sport=Badminton&status=live
exports.getAllMatches = asyncHandler(async (req, res) => {
  const { sport, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (sport) filter.sport = sport;
  if (status) filter.status = status;

  const total = await Match.countDocuments(filter);
  const matches = await Match.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: matches,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

// GET /api/matches/live
exports.getLiveMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({ status: "live" }).sort({ date: -1 });
  sendSuccess(res, 200, "Live matches.", matches);
});

// GET /api/matches/:id
exports.getMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) return sendError(res, 404, "Match not found.");
  sendSuccess(res, 200, "Match retrieved.", match);
});

// POST /api/matches
exports.createMatch = asyncHandler(async (req, res) => {
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

  const fields = ["sport", "teamA", "teamB", "scoreA", "scoreB", "date", "round", "status", "winner", "notes"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) match[f] = req.body[f];
  });

  await match.save();
  sendSuccess(res, 200, "Match updated.", match);
});

// DELETE /api/matches/:id
exports.deleteMatch = asyncHandler(async (req, res) => {
  const match = await Match.findByIdAndDelete(req.params.id);
  if (!match) return sendError(res, 404, "Match not found.");
  sendSuccess(res, 200, "Match deleted.");
});
