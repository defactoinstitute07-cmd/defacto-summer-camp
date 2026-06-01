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
  const isAdmin = req.admin.role === "admin";
  const permissions = req.admin.sportsPermissions || [];

  const playerFilter = isAdmin ? { sport: { $in: permissions } } : {};
  const activePlayerFilter = isAdmin ? { sport: { $in: permissions }, isActive: true } : { isActive: true };
  const matchFilter = isAdmin ? { sport: { $in: permissions } } : {};
  const liveMatchFilter = isAdmin ? { sport: { $in: permissions }, status: "live" } : { status: "live" };
  const completedMatchFilter = isAdmin ? { sport: { $in: permissions }, status: "completed" } : { status: "completed" };
  const upcomingMatchFilter = isAdmin ? { sport: { $in: permissions }, status: "upcoming" } : { status: "upcoming" };
  const pointsFilter = isAdmin ? { sport: { $in: permissions } } : {};
  const attendanceFilter = isAdmin ? { sport: { $in: permissions } } : {};
  const presentAttendanceFilter = isAdmin ? { sport: { $in: permissions }, present: true } : { present: true };

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
    Player.countDocuments(playerFilter),
    Player.countDocuments(activePlayerFilter),
    Match.countDocuments(matchFilter),
    Match.countDocuments(liveMatchFilter),
    Match.countDocuments(completedMatchFilter),
    Match.countDocuments(upcomingMatchFilter),
    Volunteer.countDocuments({ isActive: true }),
    Organizer.countDocuments({ isActive: true }),
    Announcement.countDocuments({ isVisible: true }),
    Announcement.countDocuments({ isPinned: true, isVisible: true }),
    Gallery.countDocuments(),
    Attendance.countDocuments(attendanceFilter),
  ]);

  // Attendance percentage (present / total records)
  const presentCount = await Attendance.countDocuments(presentAttendanceFilter);
  const overallAttendancePct =
    totalAttendanceRecords > 0
      ? Math.round((presentCount / totalAttendanceRecords) * 100)
      : 0;

  // Sport breakdown for players
  const sportBreakdown = await Player.aggregate([
    { $match: activePlayerFilter },
    { $group: { _id: "$sport", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Recent 5 matches
  const recentMatches = await Match.find(matchFilter)
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  // Recent 5 announcements (keep global)
  const recentAnnouncements = await Announcement.find({ isVisible: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("postedBy", "username")
    .lean();

  // Top 5 points leaders
  const topRankers = await PointsEntry.find(pointsFilter)
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
      totalVolunteers: isAdmin ? 0 : totalVolunteers,
      totalOrganizers: isAdmin ? 0 : totalOrganizers,
      totalAnnouncements,
      totalGalleryImages: isAdmin ? 0 : totalGalleryImages,
      overallAttendancePct,
    },
    sportBreakdown,
    recentMatches,
    recentAnnouncements,
    topRankers,
  });
});
