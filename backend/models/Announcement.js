const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Announcement content is required"],
      trim: true,
      maxlength: [2000, "Content cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["info", "result", "urgent", "general", "schedule"],
      default: "general",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Pinned first, then newest first
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ isVisible: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
