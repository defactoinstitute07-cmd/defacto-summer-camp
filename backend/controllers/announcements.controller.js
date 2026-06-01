const Announcement = require("../models/Announcement");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/announcements?type=urgent&pinned=true
exports.getAllAnnouncements = asyncHandler(async (req, res) => {
  const { type, pinned, page = 1, limit = 20 } = req.query;
  const filter = { isVisible: true };
  if (type) filter.type = type;
  if (pinned !== undefined) filter.isPinned = pinned === "true";

  const total = await Announcement.countDocuments(filter);
  const announcements = await Announcement.find(filter)
    .populate("postedBy", "username")
    .sort({ isPinned: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: announcements,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

// GET /api/announcements/:id
exports.getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id).populate("postedBy", "username");
  if (!announcement) return sendError(res, 404, "Announcement not found.");
  sendSuccess(res, 200, "Announcement retrieved.", announcement);
});

// POST /api/announcements
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { title, content, type, isPinned, isVisible } = req.body;
  const announcement = await Announcement.create({
    title,
    content,
    type,
    isPinned,
    isVisible,
    postedBy: req.admin._id,
  });

  sendSuccess(res, 201, "Announcement posted.", announcement);
});

// PUT /api/announcements/:id
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return sendError(res, 404, "Announcement not found.");

  const fields = ["title", "content", "type", "isPinned", "isVisible"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) announcement[f] = req.body[f];
  });

  await announcement.save();
  sendSuccess(res, 200, "Announcement updated.", announcement);
});

// DELETE /api/announcements/:id
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) return sendError(res, 404, "Announcement not found.");
  sendSuccess(res, 200, "Announcement deleted.");
});
