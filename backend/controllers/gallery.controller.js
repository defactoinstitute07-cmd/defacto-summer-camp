const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET /api/gallery?category=match&page=1&limit=24
exports.getAllImages = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 24 } = req.query;
  const filter = category ? { category } : {};

  const total = await Gallery.countDocuments(filter);
  const images = await Gallery.find(filter)
    .populate("uploadedBy", "username")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: images,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

// GET /api/gallery/category/:category
exports.getByCategory = asyncHandler(async (req, res) => {
  const images = await Gallery.find({ category: req.params.category })
    .sort({ createdAt: -1 })
    .limit(50);
  sendSuccess(res, 200, `Gallery for category: ${req.params.category}.`, images);
});

// POST /api/gallery — multipart/form-data with image field
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 400, "No image file provided.");

  const { title, category } = req.body;
  const image = await Gallery.create({
    title: title || "",
    imageUrl: req.file.path,
    imagePublicId: req.file.filename,
    category: category || "general",
    uploadedBy: req.admin._id,
  });

  sendSuccess(res, 201, "Image uploaded to gallery.", image);
});

// POST /api/gallery/bulk — multiple images in one request
exports.bulkUpload = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0)
    return sendError(res, 400, "No image files provided.");

  const { category } = req.body;
  const docs = req.files.map((file) => ({
    imageUrl: file.path,
    imagePublicId: file.filename,
    category: category || "general",
    uploadedBy: req.admin._id,
  }));

  const images = await Gallery.insertMany(docs);
  sendSuccess(res, 201, `${images.length} images uploaded.`, images);
});

// DELETE /api/gallery/:id
exports.deleteImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) return sendError(res, 404, "Image not found.");

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(image.imagePublicId);

  await Gallery.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Image deleted from gallery and Cloudinary.");
});
