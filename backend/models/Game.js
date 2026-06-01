const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Game name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Game name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    iconName: {
      type: String,
      default: "Activity", // Default Lucide icon name fallback
      trim: true,
    },
    imageSrc: {
      type: String,
      default: "", // Cloudinary image URL
    },
    imagePublicId: {
      type: String,
      default: "", // Cloudinary public ID for deletion
    },
    order: {
      type: Number,
      default: 0, // Custom order for sorting
    },
  },
  {
    timestamps: true,
  }
);

gameSchema.index({ status: 1 });

const Game = mongoose.model("Game", gameSchema);
module.exports = Game;
