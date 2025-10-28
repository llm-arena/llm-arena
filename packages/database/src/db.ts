import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { createDbConnection } from './connection';
import { Env } from './env';
import type * as schema from './schema';

// Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
const globalForDb = globalThis as unknown as {
  drizzle: PostgresJsDatabase<typeof schema>;
};

const db = globalForDb.drizzle || createDbConnection();

// Only store in global during development to prevent hot reload issues
if (Env.NODE_ENV !== 'production') {
  globalForDb.drizzle = db;
}

export { db };

