const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/matches.controller");
const { protect, optionalProtect } = require("../middleware/auth");

const validation = [
  body("sport").notEmpty().withMessage("Sport is required."),
  body("teamA").notEmpty().withMessage("Team A is required."),
  body("teamB").notEmpty().withMessage("Team B is required."),
  body("date").isISO8601().withMessage("Valid ISO date required.").toDate(),
  body("status").optional().isIn(["upcoming", "live", "paused", "completed"]).withMessage("Invalid status."),
  body("scoreA").optional().isInt({ min: 0 }).withMessage("Score A must be >= 0."),
  body("scoreB").optional().isInt({ min: 0 }).withMessage("Score B must be >= 0."),
  body("maxPoints").optional().isInt({ min: 0 }).withMessage("Maximum points must be >= 0."),
];

// Public
router.get("/", optionalProtect, ctrl.getAllMatches);
router.get("/live", ctrl.getLiveMatches);
router.get("/:id/score", optionalProtect, ctrl.getMatchScore);
router.get("/:id", optionalProtect, ctrl.getMatch);
router.patch("/:id/view", ctrl.incrementMatchViews);

// Protected
router.post("/", protect, validation, ctrl.createMatch);
router.put("/:id", protect, validation, ctrl.updateMatch);
router.delete("/:id", protect, ctrl.deleteMatch);

module.exports = router;
