const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      maxlength: [80, "Team name cannot exceed 80 characters"],
    },
    sport: {
      type: String,
      required: [true, "Sport is required"],
      trim: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    logoUrl: {
      type: String,
      default: "",
    },
    logoPublicId: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#0B1C4A",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate team names within the same sport
teamSchema.index({ name: 1, sport: 1 }, { unique: true });
teamSchema.index({ sport: 1 });

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
