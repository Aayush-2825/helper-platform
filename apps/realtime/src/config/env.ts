// Environment validation
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
  const requiredEnvs = [
    "DATABASE_URL",
    "REDIS_URL",
  ];

  const missing = requiredEnvs.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(", ")}\n` +
      `See .env.example for required variables`
    );
  }

  return {
    PORT: Number(process.env.PORT) || 3001,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    CORS_ALLOWED_ORIGINS: parseAllowedOrigins(process.env.CORS_ORIGIN),
  };
}

export const env = validateEnv();

