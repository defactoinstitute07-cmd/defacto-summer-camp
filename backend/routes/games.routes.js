const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/games.controller");
const { protect } = require("../middleware/auth");
const { gameUpload } = require("../middleware/upload");

const validation = [
  body("name").notEmpty().withMessage("Game name is required.").trim(),
  body("description").notEmpty().withMessage("Description is required.").trim(),
  body("status")
    .optional()
    .isIn(["upcoming", "ongoing", "completed"])
    .withMessage("Invalid game status."),
  body("order").optional().isInt().withMessage("Order must be an integer."),
];

// Public Routes
router.get("/", ctrl.getAllGames);
router.get("/:id", ctrl.getGame);
router.get("/:id/details", ctrl.getGameDetails);

// Protected Routes (Admin only)
router.post("/", protect, gameUpload.single("image"), validation, ctrl.createGame);
router.put("/:id", protect, gameUpload.single("image"), validation, ctrl.updateGame);
router.delete("/:id", protect, ctrl.deleteGame);

module.exports = router;
