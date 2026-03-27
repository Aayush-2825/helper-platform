import { drizzle } from "drizzle-orm/node-postgres";
import type { PoolConfig } from "pg";
import { Pool } from "pg";

type Schema = Record<string, unknown>;

type CreateDatabaseOptions<TSchema extends Schema | undefined = undefined> = {
  connectionString?: string;
  poolConfig?: Omit<PoolConfig, "connectionString">;
  schema?: TSchema;
};

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  const connectionString = env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return connectionString;
}

export function createPool(
  connectionString = getDatabaseUrl(),
  poolConfig: Omit<PoolConfig, "connectionString"> = {},
) {
  return new Pool({
    connectionString,
    ...poolConfig,
  });
}

export function createDatabase<TSchema extends Schema | undefined = undefined>(
  options: CreateDatabaseOptions<TSchema> = {},
) {
  const connectionString = options.connectionString ?? getDatabaseUrl();
  const pool = createPool(connectionString, options.poolConfig);
  const db = options.schema ? drizzle(pool, { schema: options.schema }) : drizzle(pool);

  return {
    pool,
    db,
  };
}
