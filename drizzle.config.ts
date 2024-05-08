import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './app/lib/schema.server.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? '',
  },
});
