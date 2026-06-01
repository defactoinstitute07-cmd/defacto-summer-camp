const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    age: {
      type: Number,
      min: [4, "Age must be at least 4"],
      max: [25, "Age cannot exceed 25"],
    },
    sport: {
      type: String,
      required: [true, "Sport/activity is required"],
      trim: true,
    },
    team: {
      type: String,
      trim: true,
      maxlength: [80, "Team name cannot exceed 80 characters"],
      default: "",
    },
    teamRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    profileImagePublicId: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

playerSchema.index({ sport: 1, isActive: 1 });
playerSchema.index({ name: "text" }); // Full-text search on name

const Player = mongoose.model("Player", playerSchema);
module.exports = Player;
