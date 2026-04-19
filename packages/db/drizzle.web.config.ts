/// <reference types="node" />

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL_WEB || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL_WEB (or DATABASE_URL fallback) is not set in the environment"
  );
}

export default defineConfig({
  schema: ["./src/schema/enums.ts", "./src/schema/web.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
