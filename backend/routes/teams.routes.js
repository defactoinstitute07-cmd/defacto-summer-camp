const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/teams.controller");
const { protect, optionalProtect } = require("../middleware/auth");
const { teamUpload } = require("../middleware/upload");

// Public Routes
router.get("/", optionalProtect, ctrl.getAllTeams);
router.get("/:id", optionalProtect, ctrl.getTeam);
router.get("/:id/roster", optionalProtect, ctrl.getRoster);

// Protected Admin Routes
router.post("/", protect, teamUpload.single("logo"), ctrl.createTeam);
router.put("/:id", protect, teamUpload.single("logo"), ctrl.updateTeam);
router.delete("/:id", protect, ctrl.deleteTeam);
router.post("/:id/players", protect, ctrl.addPlayerToTeam);
router.delete("/:id/players/:playerId", protect, ctrl.removePlayerFromTeam);

module.exports = router;
