/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in .env file');
}

export default defineConfig({
  schema: "../../packages/db/src/schema/realtime.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  }
});
