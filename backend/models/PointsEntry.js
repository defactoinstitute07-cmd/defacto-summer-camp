const mongoose = require("mongoose");

const pointsEntrySchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: [true, "Sport is required"],
      trim: true,
    },
    // Either a team name OR a player reference — both are optional
    teamName: {
      type: String,
      trim: true,
      default: "",
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    // Player/team display name (cached to avoid lookups on list views)
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      maxlength: [100, "Display name cannot exceed 100 characters"],
    },
    played: { type: Number, default: 0, min: 0 },
    won: { type: Number, default: 0, min: 0 },
    lost: { type: Number, default: 0, min: 0 },
    drawn: { type: Number, default: 0, min: 0 },
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

pointsEntrySchema.index({ sport: 1, rank: 1 });
pointsEntrySchema.index({ sport: 1, points: -1 });

const PointsEntry = mongoose.model("PointsEntry", pointsEntrySchema);
module.exports = PointsEntry;
