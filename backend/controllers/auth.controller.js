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

  // Get admin with password field (by email or mobile number)
  let admin;
  if (email.includes("@")) {
    admin = await Admin.findOne({ email, isActive: true }).select("+password");
  } else {
    admin = await Admin.findOne({ mobileNumber: email, isActive: true }).select("+password");
  }

  if (!admin) return sendError(res, 401, "Invalid credentials.");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return sendError(res, 401, "Invalid credentials.");

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

// POST /api/auth/register-game-admin
exports.registerGameAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(res, 400, "Validation failed", errors.array());

  const { fullName, mobileNumber, password } = req.body;

  // Check if mobileNumber already exists
  const existing = await Admin.findOne({ mobileNumber });
  if (existing) {
    return sendError(res, 400, "An account with this mobile number already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    username: mobileNumber,
    email: `${mobileNumber}@defacto.temp`,
    fullName,
    mobileNumber,
    password: passwordHash,
    role: "admin",
    status: "pending",
  });

  sendSuccess(res, 201, "Registration request submitted. Please wait for approval.", admin);
});

// PUT /api/auth/admins/:id (superadmin only)
exports.updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return sendError(res, 404, "Admin not found.");

  const { fullName, mobileNumber, status, sportsPermissions, username, email, role } = req.body;

  // Uniqueness & validation checks
  if (username !== undefined) {
    if (username.trim() === "") {
      admin.username = undefined;
    } else {
      if (username.length < 3) {
        return sendError(res, 400, "Username must be at least 3 characters.");
      }
      const existing = await Admin.findOne({ username, _id: { $ne: admin._id } });
      if (existing) return sendError(res, 400, "Username is already in use.");
      admin.username = username;
    }
  }

  if (email !== undefined) {
    if (email.trim() === "") {
      admin.email = undefined;
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, 400, "Please provide a valid email.");
      }
      const existing = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (existing) return sendError(res, 400, "Email is already in use.");
      admin.email = email;
    }
  }

  if (mobileNumber !== undefined) {
    if (mobileNumber.trim() === "") {
      admin.mobileNumber = undefined;
    } else {
      const existing = await Admin.findOne({ mobileNumber, _id: { $ne: admin._id } });
      if (existing) return sendError(res, 400, "Mobile number is already in use.");
      admin.mobileNumber = mobileNumber;
    }
  }

  if (fullName !== undefined) admin.fullName = fullName;
  if (sportsPermissions !== undefined) admin.sportsPermissions = sportsPermissions;

  // Safety checks if updating own account
  if (admin._id.toString() === req.admin._id.toString()) {
    if (status !== undefined && status !== "approved") {
      return sendError(res, 400, "You cannot suspend, reject, or set your own account to pending.");
    }
    if (role !== undefined && role !== "superadmin") {
      return sendError(res, 400, "You cannot change your own role from superadmin.");
    }
  } else {
    if (status !== undefined) admin.status = status;
    if (role !== undefined) admin.role = role;
  }

  await admin.save();
  sendSuccess(res, 200, "Admin details updated.", admin);
});

// PUT /api/auth/admins/:id/reset-password (superadmin only)
exports.resetAdminPassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return sendError(res, 404, "Admin not found.");

  const { password } = req.body;
  if (!password || password.length < 8) {
    return sendError(res, 400, "Password must be at least 8 characters.");
  }

  admin.password = await bcrypt.hash(password, 12);
  await admin.save({ validateBeforeSave: false });

  sendSuccess(res, 200, "Password reset successfully.");
});
