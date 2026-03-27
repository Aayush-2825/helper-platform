import { drizzle } from "drizzle-orm/node-postgres";

import { createPool, getDatabaseUrl } from "./config/index.js";
import * as schema from "./schema/realtime.js";

export const pool = createPool(getDatabaseUrl());
export const db = drizzle(pool, { schema });
export { schema };
