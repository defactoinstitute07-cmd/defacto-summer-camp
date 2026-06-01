const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/attendance.controller");
const { protect } = require("../middleware/auth");

const markValidation = [
  body("player").isMongoId().withMessage("Valid player ID required."),
  body("date").isISO8601().withMessage("Valid ISO date required.").toDate(),
  body("present").isBoolean().withMessage("Present must be true or false."),
  body("sport").optional().trim(),
  body("notes").optional().isLength({ max: 200 }).trim(),
];

// Public
router.get("/", ctrl.getAllAttendance);
router.get("/summary", ctrl.getAttendanceSummary);
router.get("/player/:playerId", ctrl.getPlayerAttendance);

// Protected
router.post("/", protect, markValidation, ctrl.markAttendance);
router.post("/bulk", protect, ctrl.bulkMarkAttendance);
router.put("/:id", protect, ctrl.updateAttendance);
router.delete("/:id", protect, ctrl.deleteAttendance);

module.exports = router;
