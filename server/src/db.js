import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not configured. Copy server/.env.example to server/.env and add your PostgreSQL connection string.');
}
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 7000,
  idleTimeoutMillis: 30000,
});
pool.on('error', (err) => console.error('Unexpected PostgreSQL pool error:', err.message));
