const PointsEntry = require("../models/PointsEntry");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/points?sport=Badminton
exports.getAllPoints = asyncHandler(async (req, res) => {
  const { sport } = req.query;
  const filter = sport ? { sport } : {};
  const entries = await PointsEntry.find(filter)
    .populate("player", "name profileImageUrl sport")
    .sort({ sport: 1, rank: 1, points: -1 });
  sendSuccess(res, 200, "Points table retrieved.", entries);
});

// GET /api/points/sport/:sport
exports.getPointsBySport = asyncHandler(async (req, res) => {
  const entries = await PointsEntry.find({ sport: req.params.sport })
    .populate("player", "name profileImageUrl")
    .sort({ rank: 1, points: -1 });
  sendSuccess(res, 200, `Points table for ${req.params.sport}.`, entries);
});

// POST /api/points
exports.createEntry = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const entry = await PointsEntry.create(req.body);
  sendSuccess(res, 201, "Points entry created.", entry);
});

// PUT /api/points/:id
exports.updateEntry = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const entry = await PointsEntry.findById(req.params.id);
  if (!entry) return sendError(res, 404, "Points entry not found.");

  const fields = ["sport", "teamName", "displayName", "played", "won", "lost", "drawn", "points", "rank", "player"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) entry[f] = req.body[f];
  });

  await entry.save();
  sendSuccess(res, 200, "Points entry updated.", entry);
});

// DELETE /api/points/:id
exports.deleteEntry = asyncHandler(async (req, res) => {
  const entry = await PointsEntry.findByIdAndDelete(req.params.id);
  if (!entry) return sendError(res, 404, "Points entry not found.");
  sendSuccess(res, 200, "Points entry deleted.");
});
