import { sql, getConnection } from '../config/database';

export interface DatabaseOperationStatus {
  success: boolean;
  error?: string;
}

export interface DatabaseStatus {
  read: DatabaseOperationStatus;
  update: DatabaseOperationStatus;
  delete: DatabaseOperationStatus;
}

/**
 * Test database read operation
 */
async function testReadOperation(): Promise<DatabaseOperationStatus> {
  try {
    const pool = await getConnection();
    // Simple read test - check if we can query system tables
    await pool.request().query('SELECT 1 AS TestValue');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during read operation',
    };
  }
}

/**
 * Test database update operation
 */
async function testUpdateOperation(): Promise<DatabaseOperationStatus> {
  try {
    const pool = await getConnection();
    // Create a temporary test table, update it, and clean up
    const testTableName = `TestUpdate_${Date.now()}`;
    
    // Create temp table
    await pool.request().query(`
      CREATE TABLE #${testTableName} (
        Id INT PRIMARY KEY,
        TestValue NVARCHAR(50)
      )
    `);
    
    // Insert a test row
    await pool.request().query(`
      INSERT INTO #${testTableName} (Id, TestValue) 
      VALUES (1, 'Initial')
    `);
    
    // Update the row
    await pool.request().query(`
      UPDATE #${testTableName} 
      SET TestValue = 'Updated' 
      WHERE Id = 1
    `);
    
    // Verify update
    const result = await pool.request().query(`
      SELECT TestValue FROM #${testTableName} WHERE Id = 1
    `);
    
    if (result.recordset[0].TestValue !== 'Updated') {
      throw new Error('Update verification failed');
    }
    
    // Temp table is automatically dropped when connection closes
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during update operation',
    };
  }
}

/**
 * Test database delete operation
 */
async function testDeleteOperation(): Promise<DatabaseOperationStatus> {
  try {
    const pool = await getConnection();
    // Create a temporary test table, insert and delete data
    const testTableName = `TestDelete_${Date.now()}`;
    
    // Create temp table
    await pool.request().query(`
      CREATE TABLE #${testTableName} (
        Id INT PRIMARY KEY,
        TestValue NVARCHAR(50)
      )
    `);
    
    // Insert test rows
    await pool.request().query(`
      INSERT INTO #${testTableName} (Id, TestValue) 
      VALUES (1, 'Test1'), (2, 'Test2')
    `);
    
    // Delete one row
    await pool.request().query(`
      DELETE FROM #${testTableName} 
      WHERE Id = 1
    `);
    
    // Verify deletion
    const result = await pool.request().query(`
      SELECT COUNT(*) AS Count FROM #${testTableName}
    `);
    
    if (result.recordset[0].Count !== 1) {
      throw new Error('Delete verification failed');
    }
    
    // Temp table is automatically dropped when connection closes
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during delete operation',
    };
  }
}

/**
 * Get database connection status by testing all operations
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const [readStatus, updateStatus, deleteStatus] = await Promise.all([
    testReadOperation(),
    testUpdateOperation(),
    testDeleteOperation(),
  ]);
  
  return {
    read: readStatus,
    update: updateStatus,
    delete: deleteStatus,
  };
}
