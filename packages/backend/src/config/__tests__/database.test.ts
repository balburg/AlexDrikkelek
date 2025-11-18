import { getConnection, closeConnection, resetConnectionError } from '../database';

/**
 * Database Configuration Tests
 * 
 * These tests verify the database connection configuration and error handling.
 * They do not require an actual database connection.
 */

describe('database configuration', () => {
  afterEach(async () => {
    // Clean up connections after each test
    await closeConnection();
  });

  describe('getConnection', () => {
    it('should throw error when database is not configured', async () => {
      // Since DB environment variables are not set in test environment
      await expect(getConnection()).rejects.toThrow('Database not configured');
    });

    it('should provide detailed error message for connection failures', async () => {
      // The error should mention the required environment variables
      await expect(getConnection()).rejects.toThrow(/DB_SERVER.*DB_DATABASE.*DB_USER.*DB_PASSWORD/);
    });
  });

  describe('resetConnectionError', () => {
    it('should be callable without error', () => {
      expect(() => resetConnectionError()).not.toThrow();
    });
  });

  describe('closeConnection', () => {
    it('should close connection without error when no connection exists', async () => {
      await expect(closeConnection()).resolves.not.toThrow();
    });

    it('should reset connection error on close', async () => {
      // First try to connect (will fail)
      await expect(getConnection()).rejects.toThrow();
      
      // Close connection (should reset error)
      await closeConnection();
      
      // Try again - should get the same error, not a cached one
      await expect(getConnection()).rejects.toThrow('Database not configured');
    });
  });
});
