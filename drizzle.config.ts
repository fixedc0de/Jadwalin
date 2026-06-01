import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/db-schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 
         process.env.POSTGRES_URL || 
         process.env.POSTGRES_URL_NON_POOLING || '',
  },
  verbose: true,
  strict: true,
});