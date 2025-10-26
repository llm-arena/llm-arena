import { Env } from '@/libs/Env';
import * as schema from '@/models/Schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const createDbConnection = () => {
  try {
    const client = postgres(Env.DATABASE_URL, {
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
