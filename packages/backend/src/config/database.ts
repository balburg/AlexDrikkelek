import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend package directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config: sql.config = {
  server: process.env.DB_SERVER || '',
  database: process.env.DB_DATABASE || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  connectionTimeout: 30000, // 30 seconds for Azure SQL connection
  requestTimeout: 30000, // 30 seconds for query execution
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
    console.log('Successfully connected to SQL Server:', config.server);
    return pool;
  } catch (error) {
    // Cache the error to avoid repeated connection attempts
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide more detailed error messages based on the error type
    let detailedMessage = `Database connection failed: ${errorMessage}`;
    
    if (errorMessage.includes('Failed to connect') || errorMessage.includes('timeout')) {
      detailedMessage += '\n\nPossible causes:\n' +
        '1. Firewall rules may be blocking the connection. Check Azure SQL firewall settings.\n' +
        '2. The server name or credentials may be incorrect.\n' +
        '3. Network connectivity issues.\n' +
        `4. Server: ${config.server}, Database: ${config.database}`;
    } else if (errorMessage.includes('Login failed')) {
      detailedMessage += '\n\nThe username or password is incorrect.';
    }
    
    console.error(detailedMessage);
    connectionError = new Error(detailedMessage);
    throw connectionError;
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
  // Reset connection error to allow retry
  connectionError = null;
}

export function resetConnectionError(): void {
  connectionError = null;
}

export { sql };
