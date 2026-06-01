const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    imagePublicId: {
      type: String,
      required: [true, "Cloudinary public_id is required"],
    },
    category: {
      type: String,
      enum: ["general", "match", "ceremony", "activity", "training", "winners"],
      default: "general",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ category: 1, createdAt: -1 });

const Gallery = mongoose.model("Gallery", gallerySchema);
module.exports = Gallery;
