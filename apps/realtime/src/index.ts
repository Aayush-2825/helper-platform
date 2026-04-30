import express from "express";
import http from "http";
import cors from "cors";
import { sql } from "drizzle-orm";

import router from "./routes/helpers.js";
import realtimeRouter from "./routes/realtime.js";
import { webDb } from "./db/index.js";
import { env } from "./config/env.js";
import { logger } from "./services/logger.js";
import { initWsServer } from "./ws/server.js";
import { startBackgroundJobs } from "./services/jobs.js";

const PORT = env.PORT || 3001;

const app = express();

/**
 * Health Check Logic
 */
const healthCheck = async (_req: express.Request, res: express.Response) => {
  try {
    await webDb.execute(sql`SELECT 1`);
    return res.status(200).json({
      status: "ok",
      service: "realtime",
      database: "up",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch (error) {
    logger.error("[HealthCheck] Failed", { error });
    return res.status(503).json({
      status: "degraded",
      service: "realtime",
      database: "down",
      timestamp: new Date().toISOString(),
    });
  }
};

// =========================
// MIDDLEWARE
// =========================
app.use(cors({
  origin: env.CORS_ALLOWED_ORIGINS || "*",
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

// =========================
// ROUTES
// =========================
app.get("/health", healthCheck);
app.get("/api/realtime/health", healthCheck);
app.use("/api/helpers", router);
app.use("/api/realtime", realtimeRouter);

// =========================
// SERVER START
// =========================
const server = http.createServer(app);

// 1. Initialize WebSocket Server
initWsServer(server);

// 2. Start Background Jobs
startBackgroundJobs();

// 3. Graceful Shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`[Server] Received ${signal}, closing...`);
  server.close(() => {
    logger.info("[Server] HTTP server closed");
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error("[Server] Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

server.listen(PORT, () => {
  logger.info(`[Server] ✅ Realtime service running on port ${PORT}`);
});

// Re-export broadcastEvent for backward compatibility
export { broadcastEvent } from "./ws/dispatch.js";
