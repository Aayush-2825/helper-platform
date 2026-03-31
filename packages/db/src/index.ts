export * from "./config/index.js";
export * as schema from "./schema/index.js";
export * as webSchema from "./schema/web.js";
export * as realtimeSchema from "./schema/realtime.js";

// Export realtime db instance for easy import
export { db as realtimeDb, pool as realtimePool } from "./realtime.js";
