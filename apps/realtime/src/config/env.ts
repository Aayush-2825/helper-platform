// Environment validation
import { isValidRedisUrl } from "../utils/redis.js";

function parseAllowedOrigins(value?: string): string[] {
  if (!value || value.trim().length === 0) {
    return ["http://localhost:3000", "https://helper-platform-web.vercel.app"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter((origin) => origin.length > 0);
}

function validateEnv() {
  const isTest = process.env.NODE_ENV === "test";
  const requiredEnvs = isTest ? [] : ["DATABASE_URL"];

  const missing = requiredEnvs.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(", ")}\n` +
      `See .env.example for required variables`
    );
  }

  const rawRedisUrl = process.env.REDIS_URL?.trim();
  const validRedisUrl = isValidRedisUrl(rawRedisUrl) ? rawRedisUrl : undefined;

  return {
    PORT: Number(process.env.PORT) || 3001,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL || (isTest ? "postgresql://test:test@localhost:5432/test" : undefined),
    REDIS_URL: validRedisUrl,
    AUTH_SECRET: process.env.AUTH_SECRET || "",
    REALTIME_WS_AUTH_SECRET: process.env.REALTIME_WS_AUTH_SECRET || "",
    CORS_ALLOWED_ORIGINS: parseAllowedOrigins(process.env.CORS_ORIGIN),
    REALTIME_BROADCAST_SECRET: process.env.REALTIME_BROADCAST_SECRET || "",
  };
}

export const env = validateEnv();
