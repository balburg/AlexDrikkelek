import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  server: process.env.DB_SERVER || '',
  database: process.env.DB_DATABASE || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;
let connectionError: Error | null = null;

/**
 * Check if database configuration is valid
 */
function isDatabaseConfigured(): boolean {
  return !!(
    process.env.DB_SERVER &&
    process.env.DB_DATABASE &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD
  );
}

export async function getConnection(): Promise<sql.ConnectionPool> {
  // Check if database is configured
  if (!isDatabaseConfigured()) {
    throw new Error('Database not configured. Please set DB_SERVER, DB_DATABASE, DB_USER, and DB_PASSWORD environment variables.');
  }

  // Return existing connection if available
  if (pool) {
    return pool;
  }

  // If previous connection attempt failed, throw the cached error
  if (connectionError) {
    throw connectionError;
  }

  // Attempt to connect
  try {
    pool = await sql.connect(config);
    return pool;
  } catch (error) {
    // Cache the error to avoid repeated connection attempts
    connectionError = error instanceof Error ? error : new Error('Database connection failed');
    throw connectionError;
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };
