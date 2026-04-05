/// <reference types="node" />

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL_REALTIME || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL_REALTIME (or DATABASE_URL fallback) is not set in the environment"
  );
}

export default defineConfig({
  schema: "./src/schema/realtime.ts",
  out: "./drizzle/realtime",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
