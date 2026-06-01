const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: [true, "Sport is required"],
      trim: true,
    },
    teamA: {
      type: String,
      required: [true, "Team A / Player A name is required"],
      trim: true,
      maxlength: [100, "Team A name cannot exceed 100 characters"],
    },
    teamB: {
      type: String,
      required: [true, "Team B / Player B name is required"],
      trim: true,
      maxlength: [100, "Team B name cannot exceed 100 characters"],
    },
    scoreA: {
      type: Number,
      default: 0,
      min: 0,
    },
    scoreB: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      required: [true, "Match date is required"],
    },
    round: {
      type: String,
      trim: true,
      default: "Group Stage",
      maxlength: [60, "Round name cannot exceed 60 characters"],
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },
    winner: {
      type: String,
      trim: true,
      default: "", // "teamA" | "teamB" | "draw" | ""
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes cannot exceed 300 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ status: 1 });
matchSchema.index({ sport: 1, date: -1 });

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
