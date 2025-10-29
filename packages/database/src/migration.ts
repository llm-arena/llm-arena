import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '@lmring/env';

export async function runMigrations() {
  const client = postgres(env.DATABASE_URL, {
    prepare: false, // Required for Supabase transaction pooling mode
  });
  const db = drizzle(client);

  try {
    // Get the directory of this module file
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    // Go up one level from src/ to package root, then into migrations/
    const migrationsFolder = path.join(__dirname, '..', 'migrations');
    
    await migrate(db, {
      migrationsFolder,
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

