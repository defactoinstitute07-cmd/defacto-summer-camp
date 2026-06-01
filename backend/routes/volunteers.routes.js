const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/volunteers.controller");
const { protect } = require("../middleware/auth");
const { volunteerUpload } = require("../middleware/upload");

const validation = [
  body("name").notEmpty().withMessage("Name is required.").trim(),
  body("designation").optional().trim(),
  body("bio").optional().isLength({ max: 300 }).withMessage("Bio max 300 characters."),
];

// Public
router.get("/", ctrl.getAllVolunteers);
router.get("/:id", ctrl.getVolunteer);

// Protected
router.post("/", protect, volunteerUpload.single("image"), validation, ctrl.createVolunteer);
router.post("/bulk", protect, ctrl.bulkCreateVolunteers);
router.put("/:id", protect, volunteerUpload.single("image"), validation, ctrl.updateVolunteer);
router.delete("/:id", protect, ctrl.deleteVolunteer);

module.exports = router;
