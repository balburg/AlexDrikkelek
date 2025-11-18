import { getDatabaseStatus } from '../databaseStatusService';

/**
 * Database Status Service Tests
 * 
 * Note: These tests verify the service structure and error handling.
 * Full integration tests with actual database would require database setup.
 */

describe('databaseStatusService', () => {
  describe('getDatabaseStatus', () => {
    it('should return status for all three operations', async () => {
      const status = await getDatabaseStatus();
      
      expect(status).toBeDefined();
      expect(status.read).toBeDefined();
      expect(status.update).toBeDefined();
      expect(status.delete).toBeDefined();
    });

    it('should return proper structure for each operation status', async () => {
      const status = await getDatabaseStatus();
      
      // Each operation should have success flag
      expect(typeof status.read.success).toBe('boolean');
      expect(typeof status.update.success).toBe('boolean');
      expect(typeof status.delete.success).toBe('boolean');
    });

    it('should include error messages when operations fail', async () => {
      const status = await getDatabaseStatus();
      
      // When database is not configured, all operations should fail with error messages
      if (!status.read.success) {
        expect(status.read.error).toBeDefined();
        expect(typeof status.read.error).toBe('string');
      }
      
      if (!status.update.success) {
        expect(status.update.error).toBeDefined();
        expect(typeof status.update.error).toBe('string');
      }
      
      if (!status.delete.success) {
        expect(status.delete.error).toBeDefined();
        expect(typeof status.delete.error).toBe('string');
      }
    });
  });
});
