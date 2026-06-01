const Volunteer = require("../models/Volunteer");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { validationResult } = require("express-validator");

// GET /api/volunteers
exports.getAllVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await Volunteer.find({ isActive: true }).sort({ name: 1 });
  sendSuccess(res, 200, "Volunteers retrieved.", volunteers);
});

// GET /api/volunteers/:id
exports.getVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) return sendError(res, 404, "Volunteer not found.");
  sendSuccess(res, 200, "Volunteer retrieved.", volunteer);
});

// POST /api/volunteers
exports.createVolunteer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { name, designation, bio } = req.body;
  const volunteerData = { name, designation, bio };

  if (req.file) {
    volunteerData.imageUrl = req.file.path;
    volunteerData.imagePublicId = req.file.filename;
  }

  const volunteer = await Volunteer.create(volunteerData);
  sendSuccess(res, 201, "Volunteer created.", volunteer);
});

// POST /api/volunteers/bulk  — add many volunteers at once (no images)
exports.bulkCreateVolunteers = asyncHandler(async (req, res) => {
  const { volunteers } = req.body; // array of { name, designation }
  if (!Array.isArray(volunteers) || volunteers.length === 0)
    return sendError(res, 400, "Provide a non-empty 'volunteers' array.");

  const docs = await Volunteer.insertMany(volunteers, { ordered: false });
  sendSuccess(res, 201, `${docs.length} volunteers created.`, docs);
});

// PUT /api/volunteers/:id
exports.updateVolunteer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) return sendError(res, 404, "Volunteer not found.");

  const { name, designation, bio, isActive } = req.body;
  if (name !== undefined) volunteer.name = name;
  if (designation !== undefined) volunteer.designation = designation;
  if (bio !== undefined) volunteer.bio = bio;
  if (isActive !== undefined) volunteer.isActive = isActive;

  if (req.file) {
    if (volunteer.imagePublicId) {
      await cloudinary.uploader.destroy(volunteer.imagePublicId);
    }
    volunteer.imageUrl = req.file.path;
    volunteer.imagePublicId = req.file.filename;
  }

  await volunteer.save();
  sendSuccess(res, 200, "Volunteer updated.", volunteer);
});

// DELETE /api/volunteers/:id
exports.deleteVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) return sendError(res, 404, "Volunteer not found.");

  if (volunteer.imagePublicId) {
    await cloudinary.uploader.destroy(volunteer.imagePublicId);
  }

  await Volunteer.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Volunteer deleted.");
});
