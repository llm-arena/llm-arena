import { defineConfig } from 'drizzle-kit';
import '@lmring/env/config'; // Load environment variables first
import { env } from '@lmring/env';

export default defineConfig({
  out: './migrations',
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});

