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
const Redis = require("ioredis");
const { RedisStore } = require("rate-limit-redis");
const matchCache = require("./config/cache");

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
const teamRoutes = require("./routes/teams.routes");

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

// ─── Redis Connection ────────────────────────────────────────────────────────
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: null,
  lazyConnect: true
});

let isRedisConnected = false;

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('[Redis] Connected successfully.');
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  console.warn('[Redis] Connection failed, rate limiting fallback active:', err.message);
});

// strictLimiter: applied to POST /api/auth/*, POST /api/matches, PUT/PATCH/DELETE /api/matches/:id
/* WHY: To prevent brute-force write attacks on auth endpoints and score updates. Maximum 100 updates per 15 minutes. */
const strictMemoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests' }
});

const strictRedisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  message: { error: 'Too many write requests' }
});

const strictLimiter = (req, res, next) => {
  if (isRedisConnected) {
    return strictRedisLimiter(req, res, next);
  }
  return strictMemoryLimiter(req, res, next);
};

// publicReadLimiter: applied to GET /api/matches/*, GET /api/tournaments/*, GET /api/matches/:id/score
/* WHY: Safeguards the backend public APIs from infinite loops or client refresh storms. Limit is set to 60 reads per 1 minute (1 req/sec). */
const publicReadMemoryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { error: 'Too many requests, slow down.' }
});

const publicReadRedisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  skipSuccessfulRequests: false,
  message: { error: 'Too many requests, slow down.' }
});

const publicReadLimiter = (req, res, next) => {
  if (isRedisConnected) {
    return publicReadRedisLimiter(req, res, next);
  }
  return publicReadMemoryLimiter(req, res, next);
};

// Apply write/auth limiting
app.use("/api/auth", strictLimiter);
app.post("/api/matches", strictLimiter);
app.put("/api/matches/:id", strictLimiter);
app.patch("/api/matches/:id", strictLimiter);
app.delete("/api/matches/:id", strictLimiter);

// Apply public read limiting
app.get("/api/matches", publicReadLimiter);
app.get("/api/matches/live", publicReadLimiter);
app.get("/api/matches/:id/score", publicReadLimiter);
app.get("/api/matches/:id", publicReadLimiter);
app.use("/api/tournaments", publicReadLimiter);

// ─── Root Route ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Defacto Summer Camp API. Endpoint health check at /api/health",
  });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const io = req.app.get("io");
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    redis: redisClient.status,
    activeConnections: io ? io.engine.clientsCount : 0
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
app.use("/api/teams", teamRoutes);

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
if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT || "5000", 10);
  const server = app.listen(PORT, () => {
    console.log(
      `\n🚀 Defacto Camp API running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
    );
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });

  // Attach Socket.IO with connection recovery
  const { Server } = require("socket.io");
  const io = new Server(server, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true
    },
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);

    // Allow scoreboards or admins to join match-specific rooms
    socket.on("joinMatch", (matchId) => {
      if (matchId) {
        socket.join(`match:${matchId}`);
        console.log(`📝 Socket ${socket.id} joined room: match:${matchId}`);
      }
    });

    socket.on("rejoin-match", async (matchId) => {
      if (matchId) {
        socket.join(`match:${matchId}`);
        const cachedMatch = matchCache.get(`match:${matchId}`);
        if (cachedMatch) {
          socket.emit("matchState", cachedMatch);
        } else {
          const Match = require("./models/Match");
          const Team = require("./models/Team");
          try {
            const match = await Match.findById(matchId);
            if (match) {
              const teamAData = await Team.findOne({ name: match.teamA, sport: match.sport });
              const teamBData = await Team.findOne({ name: match.teamB, sport: match.sport });
              const payload = {
                match,
                teamALogo: teamAData ? teamAData.logoUrl : "",
                teamBLogo: teamBData ? teamBData.logoUrl : "",
                teamAColor: teamAData ? (teamAData.color || "#0B1C4A") : "#0B1C4A",
                teamBColor: teamBData ? (teamBData.color || "#0B1C4A") : "#0B1C4A",
              };
              matchCache.set(`match:${matchId}`, payload);
              socket.emit("matchState", payload);
            }
          } catch (err) {
            console.warn("[rejoin-match] Failed to fetch match:", err.message);
          }
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`📡 Socket disconnected: ${socket.id}`);
    });
  });

  // Unhandled promise rejections — log and exit gracefully
  process.on("unhandledRejection", (err) => {
    console.error("💥 Unhandled Rejection:", err.name, err.message);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
