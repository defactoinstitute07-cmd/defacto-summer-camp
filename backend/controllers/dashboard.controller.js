const Player = require("../models/Player");
const Match = require("../models/Match");
const Volunteer = require("../models/Volunteer");
const Organizer = require("../models/Organizer");
const Announcement = require("../models/Announcement");
const Gallery = require("../models/Gallery");
const Attendance = require("../models/Attendance");
const PointsEntry = require("../models/PointsEntry");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// GET /api/dashboard/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Run all counts in parallel for speed
  const [
    totalPlayers,
    activePlayers,
    totalMatches,
    liveMatches,
    completedMatches,
    upcomingMatches,
    totalVolunteers,
    totalOrganizers,
    totalAnnouncements,
    pinnedAnnouncements,
    totalGalleryImages,
    totalAttendanceRecords,
  ] = await Promise.all([
    Player.countDocuments(),
    Player.countDocuments({ isActive: true }),
    Match.countDocuments(),
    Match.countDocuments({ status: "live" }),
    Match.countDocuments({ status: "completed" }),
    Match.countDocuments({ status: "upcoming" }),
    Volunteer.countDocuments({ isActive: true }),
    Organizer.countDocuments({ isActive: true }),
    Announcement.countDocuments({ isVisible: true }),
    Announcement.countDocuments({ isPinned: true, isVisible: true }),
    Gallery.countDocuments(),
    Attendance.countDocuments(),
  ]);

  // Attendance percentage (present / total records)
  const presentCount = await Attendance.countDocuments({ present: true });
  const overallAttendancePct =
    totalAttendanceRecords > 0
      ? Math.round((presentCount / totalAttendanceRecords) * 100)
      : 0;

  // Sport breakdown for players
  const sportBreakdown = await Player.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$sport", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Recent 5 matches
  const recentMatches = await Match.find()
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  // Recent 5 announcements
  const recentAnnouncements = await Announcement.find({ isVisible: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("postedBy", "username")
    .lean();

  // Top 5 points leaders (overall)
  const topRankers = await PointsEntry.find()
    .sort({ points: -1 })
    .limit(5)
    .populate("player", "name sport profileImageUrl");

  sendSuccess(res, 200, "Dashboard statistics retrieved.", {
    overview: {
      totalPlayers,
      activePlayers,
      totalMatches,
      liveMatches,
      completedMatches,
      upcomingMatches,
      totalVolunteers,
      totalOrganizers,
      totalAnnouncements,
      pinnedAnnouncements,
      totalGalleryImages,
      overallAttendancePct,
    },
    sportBreakdown,
    recentMatches,
    recentAnnouncements,
    topRankers,
  });
});
