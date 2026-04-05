import "dotenv/config";

import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL_REALTIME || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL_REALTIME (or DATABASE_URL fallback) is not set in the environment"
  );
}

const expectedTables = [
  "active_connections",
  "booking_events",
  "helper_presence",
  "incoming_jobs",
  "location_updates",
  "notification_queue",
  "subscriptions",
];

const expectedEnums = [
  "booking_event_type",
  "helper_presence_status",
  "websocket_event_type",
];

const pool = new Pool({ connectionString: databaseUrl });

async function main() {
  const client = await pool.connect();

  try {
    const tableResult = await client.query(
      `
        select table_name
        from information_schema.tables
        where table_schema = 'realtime'
          and table_name = any($1::text[])
      `,
      [expectedTables],
    );

    const enumResult = await client.query(
      `
        select t.typname as enum_name
        from pg_type t
        join pg_namespace n on n.oid = t.typnamespace
        where n.nspname = 'public'
          and t.typtype = 'e'
          and t.typname = any($1::text[])
      `,
      [expectedEnums],
    );

    const foundTables = new Set(tableResult.rows.map((row) => row.table_name));
    const foundEnums = new Set(enumResult.rows.map((row) => row.enum_name));

    const missingTables = expectedTables.filter((tableName) => !foundTables.has(tableName));
    const missingEnums = expectedEnums.filter((enumName) => !foundEnums.has(enumName));

    if (missingTables.length > 0 || missingEnums.length > 0) {
      throw new Error(
        [
          missingTables.length > 0
            ? `Missing realtime tables: ${missingTables.join(", ")}`
            : null,
          missingEnums.length > 0
            ? `Missing required enums: ${missingEnums.join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("; "),
      );
    }

    console.log("Realtime schema verification passed.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});