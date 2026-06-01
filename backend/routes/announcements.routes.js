const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/announcements.controller");
const { protect } = require("../middleware/auth");

const validation = [
  body("title").notEmpty().withMessage("Title is required.").isLength({ max: 200 }).trim(),
  body("content").notEmpty().withMessage("Content is required.").isLength({ max: 2000 }).trim(),
  body("type")
    .optional()
    .isIn(["info", "result", "urgent", "general", "schedule"])
    .withMessage("Invalid announcement type."),
  body("isPinned").optional().isBoolean(),
  body("isVisible").optional().isBoolean(),
];

// Public
router.get("/", ctrl.getAllAnnouncements);
router.get("/:id", ctrl.getAnnouncement);

// Protected
router.post("/", protect, validation, ctrl.createAnnouncement);
router.put("/:id", protect, validation, ctrl.updateAnnouncement);
router.delete("/:id", protect, ctrl.deleteAnnouncement);

module.exports = router;
