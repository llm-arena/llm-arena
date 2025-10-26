import path from 'node:path';
import { Env } from '@/libs/Env';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

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
