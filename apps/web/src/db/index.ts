import "dotenv/config";

// Re-export DB from @repo/db/web but ensure a safe `transaction` helper
// exists in test environments where the real driver may be replaced/mocked.
import { db as _db, pool, schema } from "@repo/db/web";

const db: any = _db;

// If the underlying db doesn't expose `transaction`, provide a simple
// fallback that invokes the callback with the (possibly mocked) db.
if (typeof db.transaction !== "function") {
	db.transaction = async (fn: (tx: typeof db) => Promise<any>) => {
		return fn(db);
	};
}

export { db, pool, schema };
