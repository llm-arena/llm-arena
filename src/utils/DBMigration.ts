import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Env } from '@/libs/Env';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export async function runMigrations() {
  const client = postgres(Env.DATABASE_URL, {
    prepare: false, // Required for Supabase transaction pooling mode
  });
  const db = drizzle(client);

  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    await client.end();
  }
}

// ESM CLI guard: run migrations if this file is executed directly
const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMainModule) {
  runMigrations().catch((error) => {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  });
}
