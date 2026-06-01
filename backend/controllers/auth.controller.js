const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/** Sign JWT and optionally set httpOnly cookie */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (res, admin, statusCode, message) => {
  const token = signToken(admin._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("jwt", token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    data: { admin },
  });
};

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { email, password } = req.body;

  // Get admin with password field
  const admin = await Admin.findOne({ email, isActive: true }).select("+password");
  if (!admin) return sendError(res, 401, "Invalid email or password.");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return sendError(res, 401, "Invalid email or password.");

  // Update last login
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  // Don't leak password
  admin.password = undefined;

  sendTokenResponse(res, admin, 200, "Login successful.");
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Authenticated admin details.", req.admin);
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "logged_out", {
    expires: new Date(Date.now() + 5 * 1000), // 5 seconds
    httpOnly: true,
  });
  sendSuccess(res, 200, "Logged out successfully.");
});

// POST /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select("+password");
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) return sendError(res, 401, "Current password is incorrect.");

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save({ validateBeforeSave: false });

  sendSuccess(res, 200, "Password changed successfully.");
});

// POST /api/auth/create-admin  (superadmin only)
exports.createAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { username, email, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await Admin.create({ username, email, password: passwordHash, role });
  sendSuccess(res, 201, "Admin account created.", admin);
});

// GET /api/auth/admins (superadmin only)
exports.getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, "All admins retrieved.", admins);
});

// DELETE /api/auth/admins/:id (superadmin only)
exports.deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return sendError(res, 404, "Admin not found.");
  if (admin._id.toString() === req.admin._id.toString())
    return sendError(res, 400, "You cannot delete your own account.");

  await Admin.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, "Admin account deleted.");
});
