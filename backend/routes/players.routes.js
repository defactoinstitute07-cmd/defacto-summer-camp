const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/players.controller");
const { protect, optionalProtect } = require("../middleware/auth");
const { playerUpload } = require("../middleware/upload");

const validation = [
  body("name").notEmpty().withMessage("Name is required.").trim(),
  body("sport").notEmpty().withMessage("Sport is required."),
  body("age").optional().isInt({ min: 4, max: 25 }).withMessage("Age must be 4-25."),
  body("team").optional().trim(),
];

// Public
router.get("/", optionalProtect, ctrl.getAllPlayers);
router.get("/:id", optionalProtect, ctrl.getPlayer);

// Protected
router.post("/", protect, playerUpload.single("profileImage"), validation, ctrl.createPlayer);
router.put("/:id", protect, playerUpload.single("profileImage"), validation, ctrl.updatePlayer);
router.delete("/:id", protect, ctrl.deletePlayer);

module.exports = router;
