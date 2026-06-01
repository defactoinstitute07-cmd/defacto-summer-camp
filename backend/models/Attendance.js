const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },
    present: {
      type: Boolean,
      required: true,
      default: false,
    },
    sport: {
      type: String,
      trim: true,
      default: "General",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for same player + date + sport
attendanceSchema.index({ player: 1, date: 1, sport: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
