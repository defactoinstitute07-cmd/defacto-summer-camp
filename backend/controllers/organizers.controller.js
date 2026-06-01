const Organizer = require("../models/Organizer");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/organizers
exports.getAllOrganizers = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  const organizers = await Organizer.find(filter).sort({ order: 1, createdAt: 1 });
  sendSuccess(res, 200, "Organizers retrieved.", organizers);
});

// GET /api/organizers/:id
exports.getOrganizer = asyncHandler(async (req, res) => {
  const organizer = await Organizer.findById(req.params.id);
  if (!organizer) return sendError(res, 404, "Organizer not found.");
  sendSuccess(res, 200, "Organizer retrieved.", organizer);
});

// POST /api/organizers
exports.createOrganizer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { name, position, bio, order } = req.body;

  const organizerData = { name, position, bio, order };

  // If image uploaded via Multer → Cloudinary
  if (req.file) {
    organizerData.imageUrl = req.file.path;
    organizerData.imagePublicId = req.file.filename;
  }

  const organizer = await Organizer.create(organizerData);
  sendSuccess(res, 201, "Organizer created.", organizer);
});

// PUT /api/organizers/:id
exports.updateOrganizer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const organizer = await Organizer.findById(req.params.id);
  if (!organizer) return sendError(res, 404, "Organizer not found.");

  const { name, position, bio, order, isActive } = req.body;
  if (name !== undefined) organizer.name = name;
  if (position !== undefined) organizer.position = position;
  if (bio !== undefined) organizer.bio = bio;
  if (order !== undefined) organizer.order = order;
  if (isActive !== undefined) organizer.isActive = isActive;

  // If a new image was uploaded, delete the old one from Cloudinary first
  if (req.file) {
    if (organizer.imagePublicId) {
      await cloudinary.uploader.destroy(organizer.imagePublicId);
    }
    organizer.imageUrl = req.file.path;
    organizer.imagePublicId = req.file.filename;
  }

  await organizer.save();
  sendSuccess(res, 200, "Organizer updated.", organizer);
});

// DELETE /api/organizers/:id
exports.deleteOrganizer = asyncHandler(async (req, res) => {
  const organizer = await Organizer.findById(req.params.id);
  if (!organizer) return sendError(res, 404, "Organizer not found.");

  // Remove image from Cloudinary
  if (organizer.imagePublicId) {
    await cloudinary.uploader.destroy(organizer.imagePublicId);
  }

  await Organizer.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Organizer deleted.");
});
