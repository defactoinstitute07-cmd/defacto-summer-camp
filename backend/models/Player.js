const mongoose = require("mongoose");

const SPORTS = [
  "Badminton",
  "Volleyball",
  "Quiz Competition",
  "Cultural Activities",
  "Painting",
  "TUG-OF-WAR",
  "Fun Activities",
  "General",
];

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
      enum: SPORTS,
      required: [true, "Sport/activity is required"],
    },
    team: {
      type: String,
      trim: true,
      maxlength: [80, "Team name cannot exceed 80 characters"],
      default: "",
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
module.exports.SPORTS = SPORTS;
