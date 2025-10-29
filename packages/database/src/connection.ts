import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@lmring/env';
import * as schema from './schema';

export const createDbConnection = () => {
  try {
    const client = postgres(env.DATABASE_URL, {
      prepare: false,
    });

    return drizzle(client, { schema });
  } catch (error) {
    console.error(
      'Failed to create database connection:',
      error instanceof Error ? error.message : error,
    );
    throw new Error('Database connection failed');
  }
};

