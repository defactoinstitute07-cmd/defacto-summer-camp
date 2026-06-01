const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/points.controller");
const { protect, optionalProtect } = require("../middleware/auth");

const validation = [
  body("sport").notEmpty().withMessage("Sport is required."),
  body("displayName").notEmpty().withMessage("Display name is required."),
  body("played").optional().isInt({ min: 0 }),
  body("won").optional().isInt({ min: 0 }),
  body("lost").optional().isInt({ min: 0 }),
  body("drawn").optional().isInt({ min: 0 }),
  body("points").optional().isNumeric(),
  body("rank").optional().isInt({ min: 0 }),
];

// Public
router.get("/", optionalProtect, ctrl.getAllPoints);
router.get("/sport/:sport", optionalProtect, ctrl.getPointsBySport);

// Protected
router.post("/", protect, validation, ctrl.createEntry);
router.put("/:id", protect, validation, ctrl.updateEntry);
router.delete("/:id", protect, ctrl.deleteEntry);

module.exports = router;
