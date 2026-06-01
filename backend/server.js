/**
 * Defacto Institute Summer Camp 2026 — Backend Server
 * Express + MongoDB + JWT + Cloudinary
 */
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
// Initialise Cloudinary config on startup
require("./config/cloudinary");

// Route modules
const authRoutes = require("./routes/auth.routes");
const organizerRoutes = require("./routes/organizers.routes");
const volunteerRoutes = require("./routes/volunteers.routes");
const playerRoutes = require("./routes/players.routes");
const matchRoutes = require("./routes/matches.routes");
const pointsRoutes = require("./routes/points.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const announcementRoutes = require("./routes/announcements.routes");
const galleryRoutes = require("./routes/gallery.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const gameRoutes = require("./routes/games.routes");

// Global error handler (must be last)
const errorHandler = require("./middleware/errorHandler");

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ─── Express App ────────────────────────────────────────────────────────────
const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow Cloudinary images
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed.`));
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─── HTTP Request Logger ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ─── Global Rate Limit ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});
app.use("/api", globalLimiter);

// ─── Root Route ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Defacto Summer Camp API. Endpoint health check at /api/health",
  });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Defacto Camp API is running.",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/games", gameRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5000", 10);
const server = app.listen(PORT, () => {
  console.log(
    `\n🚀 Defacto Camp API running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
  );
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

// Unhandled promise rejections — log and exit gracefully
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.name, err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
