import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db-schema';

// Support multiple env var names for flexibility
const connectionString = 
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    '❌ DATABASE CONNECTION ERROR!\n' +
    'Please set ONE of: POSTGRES_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL\n' +
    'Get it from: Vercel Dashboard → Storage → PostgreSQL → .env.local'
  );
}

// Create postgres client
const client = postgres(connectionString, {
  max: 1, // Single connection for development
  ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
});

// Export drizzle instance with schema
export const db = drizzle(client, { schema });
export { client };