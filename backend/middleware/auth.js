const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const Admin = require("../models/Admin");

/**
 * Verifies the JWT from Authorization header (Bearer token) or httpOnly cookie.
 * Attaches the authenticated admin to req.admin.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Fallback: check httpOnly cookie
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated. Please log in to access this resource.",
    });
  }

  // Verify & decode
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Confirm admin still exists in DB
  const admin = await Admin.findById(decoded.id).select("-password");
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "The admin belonging to this token no longer exists.",
    });
  }

  req.admin = admin;
  next();
});

module.exports = { protect };
