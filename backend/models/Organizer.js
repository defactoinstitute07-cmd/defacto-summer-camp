const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    position: {
      type: String,
      required: [true, "Position/title is required"],
      trim: true,
      maxlength: [150, "Position cannot exceed 150 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0, // For sorting display order
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

organizerSchema.index({ isActive: 1, order: 1 });

const Organizer = mongoose.model("Organizer", organizerSchema);
module.exports = Organizer;
