import { defineConfig } from 'drizzle-kit';
import { Env } from './src/env';

export default defineConfig({
  out: './migrations',
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: Env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});

