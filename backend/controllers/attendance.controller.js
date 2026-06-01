const Attendance = require("../models/Attendance");
const Player = require("../models/Player");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/attendance?date=2026-06-01&sport=Badminton
exports.getAllAttendance = asyncHandler(async (req, res) => {
  const { date, sport, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }
  if (sport) filter.sport = sport;

  const total = await Attendance.countDocuments(filter);
  const records = await Attendance.find(filter)
    .populate("player", "name sport team profileImageUrl")
    .populate("markedBy", "username")
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: records,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

// GET /api/attendance/player/:playerId — full history for one player
exports.getPlayerAttendance = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.playerId);
  if (!player) return sendError(res, 404, "Player not found.");

  const records = await Attendance.find({ player: req.params.playerId }).sort({ date: -1 });

  const totalDays = records.length;
  const presentDays = records.filter((r) => r.present).length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  sendSuccess(res, 200, "Player attendance retrieved.", {
    player,
    records,
    summary: { totalDays, presentDays, absentDays: totalDays - presentDays, attendancePercentage },
  });
});

// GET /api/attendance/summary — aggregate summary per player
exports.getAttendanceSummary = asyncHandler(async (req, res) => {
  const summary = await Attendance.aggregate([
    {
      $group: {
        _id: "$player",
        totalDays: { $sum: 1 },
        presentDays: { $sum: { $cond: ["$present", 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "players",
        localField: "_id",
        foreignField: "_id",
        as: "playerInfo",
      },
    },
    { $unwind: "$playerInfo" },
    {
      $project: {
        _id: 0,
        player: "$playerInfo",
        totalDays: 1,
        presentDays: 1,
        absentDays: { $subtract: ["$totalDays", "$presentDays"] },
        attendancePercentage: {
          $round: [{ $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100] }, 0],
        },
      },
    },
    { $sort: { attendancePercentage: -1 } },
  ]);

  sendSuccess(res, 200, "Attendance summary retrieved.", summary);
});

// POST /api/attendance
exports.markAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { player, date, present, sport, notes } = req.body;
  const record = await Attendance.findOneAndUpdate(
    { player, date: new Date(date), sport: sport || "General" },
    { present, notes, markedBy: req.admin._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  sendSuccess(res, 201, "Attendance marked.", record);
});

// POST /api/attendance/bulk — mark attendance for multiple players at once
exports.bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { records, date, sport } = req.body;
  // records: [{ player: id, present: bool }]
  if (!Array.isArray(records) || records.length === 0)
    return sendError(res, 400, "Provide a non-empty 'records' array.");

  const bulkOps = records.map((r) => ({
    updateOne: {
      filter: { player: r.player, date: new Date(date), sport: sport || "General" },
      update: { $set: { present: r.present, markedBy: req.admin._id, notes: r.notes || "" } },
      upsert: true,
    },
  }));

  const result = await Attendance.bulkWrite(bulkOps);
  sendSuccess(res, 200, `Attendance marked for ${records.length} players.`, result);
});

// PUT /api/attendance/:id
exports.updateAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) return sendError(res, 404, "Attendance record not found.");

  const { present, notes } = req.body;
  if (present !== undefined) record.present = present;
  if (notes !== undefined) record.notes = notes;
  record.markedBy = req.admin._id;

  await record.save();
  sendSuccess(res, 200, "Attendance updated.", record);
});

// DELETE /api/attendance/:id
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByIdAndDelete(req.params.id);
  if (!record) return sendError(res, 404, "Attendance record not found.");
  sendSuccess(res, 200, "Attendance record deleted.");
});
