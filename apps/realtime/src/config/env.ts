// Environment validation
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
  };
}

export const env = validateEnv();

