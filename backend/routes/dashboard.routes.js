const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth");

// Admin-only — aggregated stats for the admin dashboard
router.get("/stats", protect, ctrl.getDashboardStats);

module.exports = router;
