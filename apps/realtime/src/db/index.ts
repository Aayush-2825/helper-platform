import "dotenv/config";

export { db, pool, schema } from "@repo/db/realtime";
export { db as webDb, pool as webPool, schema as webSchema } from "@repo/db/web";
