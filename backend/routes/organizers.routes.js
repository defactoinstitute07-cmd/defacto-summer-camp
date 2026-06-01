const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/organizers.controller");
const { protect } = require("../middleware/auth");
const { organizerUpload } = require("../middleware/upload");

const validation = [
  body("name").notEmpty().withMessage("Name is required.").trim(),
  body("position").notEmpty().withMessage("Position is required.").trim(),
  body("bio").optional().isLength({ max: 500 }).withMessage("Bio max 500 characters."),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a non-negative integer."),
];

// Public
router.get("/", ctrl.getAllOrganizers);
router.get("/:id", ctrl.getOrganizer);

// Protected
router.post("/", protect, organizerUpload.single("image"), validation, ctrl.createOrganizer);
router.put("/:id", protect, organizerUpload.single("image"), validation, ctrl.updateOrganizer);
router.delete("/:id", protect, ctrl.deleteOrganizer);

module.exports = router;
