const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/roles");

// Strict rate limit for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginValidation = [
  body("email").isEmail().withMessage("Valid email required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters."),
];

const createAdminValidation = [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters."),
  body("email").isEmail().withMessage("Valid email required.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("role").optional().isIn(["admin", "superadmin"]).withMessage("Role must be admin or superadmin."),
];

router.post("/login", loginLimiter, loginValidation, ctrl.login);
router.get("/me", protect, ctrl.getMe);
router.post("/logout", protect, ctrl.logout);
router.post("/change-password", protect, changePasswordValidation, ctrl.changePassword);

// Superadmin-only
router.post("/admins", protect, restrictTo("superadmin"), createAdminValidation, ctrl.createAdmin);
router.get("/admins", protect, restrictTo("superadmin"), ctrl.getAllAdmins);
router.delete("/admins/:id", protect, restrictTo("superadmin"), ctrl.deleteAdmin);

module.exports = router;
