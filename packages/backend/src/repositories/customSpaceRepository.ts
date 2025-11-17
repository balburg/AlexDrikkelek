import { sql, getConnection } from '../config/database';
import { CustomSpace, CustomSpacePack, CustomSpaceType } from '../models/types';

/**
 * CustomSpace Repository
 * Handles all database operations for CustomSpacePacks and CustomSpaces
 */

interface CustomSpacePackRow {
  Id: string;
  Name: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: Date;
  UpdatedAt: Date;
}

interface CustomSpaceRow {
  Id: string;
  PackId: string;
  Name: string;
  Description: string;
  Type: string;
  LogoUrl: string | null;
  BackgroundUrl: string | null;
  ImageUrl: string | null;
  BackgroundColor: string | null;
  TextColor: string | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

/**
 * Convert database row to CustomSpacePack model
 */
async function mapRowToCustomSpacePack(row: CustomSpacePackRow): Promise<CustomSpacePack> {
  // Get all spaces for this pack
  const spaces = await getSpacesByPackId(row.Id);
  
  return {
    id: row.Id,
    name: row.Name,
    description: row.Description,
    isActive: row.IsActive,
    spaces,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

/**
 * Convert database row to CustomSpace model
 */
function mapRowToCustomSpace(row: CustomSpaceRow): CustomSpace {
  return {
    id: row.Id,
    packId: row.PackId,
    name: row.Name,
    description: row.Description,
    type: row.Type as CustomSpaceType,
    logoUrl: row.LogoUrl || undefined,
    backgroundUrl: row.BackgroundUrl || undefined,
    imageUrl: row.ImageUrl || undefined,
    backgroundColor: row.BackgroundColor || undefined,
    textColor: row.TextColor || undefined,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

/**
 * Get all spaces for a specific pack
 */
async function getSpacesByPackId(packId: string): Promise<CustomSpace[]> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('packId', sql.UniqueIdentifier, packId)
      .query<CustomSpaceRow>('SELECT * FROM CustomSpaces WHERE PackId = @packId ORDER BY CreatedAt ASC');
    
    return result.recordset.map(mapRowToCustomSpace);
  } catch (error) {
    console.error('Error getting spaces by pack ID from database:', error);
    throw error;
  }
}

/**
 * Get all custom space packs from the database
 */
export async function getAllPacks(): Promise<CustomSpacePack[]> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query<CustomSpacePackRow>('SELECT * FROM CustomSpacePacks ORDER BY CreatedAt DESC');
    
    const packs: CustomSpacePack[] = [];
    for (const row of result.recordset) {
      packs.push(await mapRowToCustomSpacePack(row));
    }
    
    return packs;
  } catch (error) {
    console.error('Error getting all custom space packs from database:', error);
    throw error;
  }
}

/**
 * Get active custom space packs from the database
 */
export async function getActivePacks(): Promise<CustomSpacePack[]> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query<CustomSpacePackRow>('SELECT * FROM CustomSpacePacks WHERE IsActive = 1 ORDER BY CreatedAt DESC');
    
    const packs: CustomSpacePack[] = [];
    for (const row of result.recordset) {
      packs.push(await mapRowToCustomSpacePack(row));
    }
    
    return packs;
  } catch (error) {
    console.error('Error getting active custom space packs from database:', error);
    throw error;
  }
}

/**
 * Get custom space pack by ID from the database
 */
export async function getPackById(packId: string): Promise<CustomSpacePack | null> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('packId', sql.UniqueIdentifier, packId)
      .query<CustomSpacePackRow>('SELECT * FROM CustomSpacePacks WHERE Id = @packId');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return await mapRowToCustomSpacePack(result.recordset[0]);
  } catch (error) {
    console.error('Error getting custom space pack by ID from database:', error);
    throw error;
  }
}

/**
 * Create a new custom space pack in the database
 */
export async function createPack(
  id: string,
  name: string,
  description: string,
  isActive: boolean
): Promise<CustomSpacePack> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(100), name)
      .input('description', sql.NVarChar(500), description)
      .input('isActive', sql.Bit, isActive)
      .input('createdAt', sql.DateTime2, now)
      .input('updatedAt', sql.DateTime2, now)
      .query(`
        INSERT INTO CustomSpacePacks (Id, Name, Description, IsActive, CreatedAt, UpdatedAt)
        VALUES (@id, @name, @description, @isActive, @createdAt, @updatedAt)
      `);
    
    return {
      id,
      name,
      description,
      isActive,
      spaces: [],
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating custom space pack in database:', error);
    throw error;
  }
}

/**
 * Update a custom space pack in the database
 */
export async function updatePack(
  packId: string,
  updates: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<CustomSpacePack> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    // Build dynamic update query
    const setParts: string[] = [];
    const request = pool.request();
    request.input('packId', sql.UniqueIdentifier, packId);
    
    if (updates.name !== undefined) {
      setParts.push('Name = @name');
      request.input('name', sql.NVarChar(100), updates.name);
    }
    
    if (updates.description !== undefined) {
      setParts.push('Description = @description');
      request.input('description', sql.NVarChar(500), updates.description);
    }
    
    if (updates.isActive !== undefined) {
      setParts.push('IsActive = @isActive');
      request.input('isActive', sql.Bit, updates.isActive);
    }
    
    setParts.push('UpdatedAt = @updatedAt');
    request.input('updatedAt', sql.DateTime2, now);
    
    if (setParts.length === 1) {
      // Only updatedAt, no actual changes
      const existing = await getPackById(packId);
      if (!existing) {
        throw new Error('Pack not found');
      }
      return existing;
    }
    
    await request.query(`UPDATE CustomSpacePacks SET ${setParts.join(', ')} WHERE Id = @packId`);
    
    const updated = await getPackById(packId);
    if (!updated) {
      throw new Error('Pack not found after update');
    }
    
    return updated;
  } catch (error) {
    console.error('Error updating custom space pack in database:', error);
    throw error;
  }
}

/**
 * Delete a custom space pack from the database
 * Cascades to delete all associated spaces
 */
export async function deletePack(packId: string): Promise<void> {
  try {
    const pool = await getConnection();
    
    await pool
      .request()
      .input('packId', sql.UniqueIdentifier, packId)
      .query('DELETE FROM CustomSpacePacks WHERE Id = @packId');
  } catch (error) {
    console.error('Error deleting custom space pack from database:', error);
    throw error;
  }
}

/**
 * Create a custom space in a pack
 */
export async function createSpace(
  id: string,
  packId: string,
  name: string,
  description: string,
  type: CustomSpaceType,
  options?: {
    logoUrl?: string;
    backgroundUrl?: string;
    imageUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  }
): Promise<CustomSpace> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('packId', sql.UniqueIdentifier, packId)
      .input('name', sql.NVarChar(100), name)
      .input('description', sql.NVarChar(500), description)
      .input('type', sql.NVarChar(20), type)
      .input('logoUrl', sql.NVarChar(500), options?.logoUrl || null)
      .input('backgroundUrl', sql.NVarChar(500), options?.backgroundUrl || null)
      .input('imageUrl', sql.NVarChar(500), options?.imageUrl || null)
      .input('backgroundColor', sql.NVarChar(20), options?.backgroundColor || null)
      .input('textColor', sql.NVarChar(20), options?.textColor || null)
      .input('createdAt', sql.DateTime2, now)
      .input('updatedAt', sql.DateTime2, now)
      .query(`
        INSERT INTO CustomSpaces (
          Id, PackId, Name, Description, Type,
          LogoUrl, BackgroundUrl, ImageUrl, BackgroundColor, TextColor,
          CreatedAt, UpdatedAt
        ) VALUES (
          @id, @packId, @name, @description, @type,
          @logoUrl, @backgroundUrl, @imageUrl, @backgroundColor, @textColor,
          @createdAt, @updatedAt
        )
      `);
    
    // Update pack's UpdatedAt
    await pool
      .request()
      .input('packId', sql.UniqueIdentifier, packId)
      .input('updatedAt', sql.DateTime2, now)
      .query('UPDATE CustomSpacePacks SET UpdatedAt = @updatedAt WHERE Id = @packId');
    
    return {
      id,
      packId,
      name,
      description,
      type,
      logoUrl: options?.logoUrl,
      backgroundUrl: options?.backgroundUrl,
      imageUrl: options?.imageUrl,
      backgroundColor: options?.backgroundColor,
      textColor: options?.textColor,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating custom space in database:', error);
    throw error;
  }
}

/**
 * Get a custom space by ID
 */
export async function getSpaceById(spaceId: string): Promise<CustomSpace | null> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('spaceId', sql.UniqueIdentifier, spaceId)
      .query<CustomSpaceRow>('SELECT * FROM CustomSpaces WHERE Id = @spaceId');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return mapRowToCustomSpace(result.recordset[0]);
  } catch (error) {
    console.error('Error getting custom space by ID from database:', error);
    throw error;
  }
}

/**
 * Update a custom space
 */
export async function updateSpace(
  spaceId: string,
  updates: {
    name?: string;
    description?: string;
    type?: CustomSpaceType;
    logoUrl?: string;
    backgroundUrl?: string;
    imageUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  }
): Promise<CustomSpace> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    // Get the space first to get its packId
    const space = await getSpaceById(spaceId);
    if (!space) {
      throw new Error('Space not found');
    }
    
    // Build dynamic update query
    const setParts: string[] = [];
    const request = pool.request();
    request.input('spaceId', sql.UniqueIdentifier, spaceId);
    
    if (updates.name !== undefined) {
      setParts.push('Name = @name');
      request.input('name', sql.NVarChar(100), updates.name);
    }
    
    if (updates.description !== undefined) {
      setParts.push('Description = @description');
      request.input('description', sql.NVarChar(500), updates.description);
    }
    
    if (updates.type !== undefined) {
      setParts.push('Type = @type');
      request.input('type', sql.NVarChar(20), updates.type);
    }
    
    if (updates.logoUrl !== undefined) {
      setParts.push('LogoUrl = @logoUrl');
      request.input('logoUrl', sql.NVarChar(500), updates.logoUrl || null);
    }
    
    if (updates.backgroundUrl !== undefined) {
      setParts.push('BackgroundUrl = @backgroundUrl');
      request.input('backgroundUrl', sql.NVarChar(500), updates.backgroundUrl || null);
    }
    
    if (updates.imageUrl !== undefined) {
      setParts.push('ImageUrl = @imageUrl');
      request.input('imageUrl', sql.NVarChar(500), updates.imageUrl || null);
    }
    
    if (updates.backgroundColor !== undefined) {
      setParts.push('BackgroundColor = @backgroundColor');
      request.input('backgroundColor', sql.NVarChar(20), updates.backgroundColor || null);
    }
    
    if (updates.textColor !== undefined) {
      setParts.push('TextColor = @textColor');
      request.input('textColor', sql.NVarChar(20), updates.textColor || null);
    }
    
    setParts.push('UpdatedAt = @updatedAt');
    request.input('updatedAt', sql.DateTime2, now);
    
    if (setParts.length === 1) {
      // Only updatedAt, no actual changes
      return space;
    }
    
    await request.query(`UPDATE CustomSpaces SET ${setParts.join(', ')} WHERE Id = @spaceId`);
    
    // Update pack's UpdatedAt
    await pool
      .request()
      .input('packId', sql.UniqueIdentifier, space.packId)
      .input('updatedAt', sql.DateTime2, now)
      .query('UPDATE CustomSpacePacks SET UpdatedAt = @updatedAt WHERE Id = @packId');
    
    const updated = await getSpaceById(spaceId);
    if (!updated) {
      throw new Error('Space not found after update');
    }
    
    return updated;
  } catch (error) {
    console.error('Error updating custom space in database:', error);
    throw error;
  }
}

/**
 * Delete a custom space
 */
export async function deleteSpace(spaceId: string): Promise<void> {
  try {
    const pool = await getConnection();
    
    // Get the space first to get its packId
    const space = await getSpaceById(spaceId);
    if (!space) {
      throw new Error('Space not found');
    }
    
    const now = new Date();
    
    await pool
      .request()
      .input('spaceId', sql.UniqueIdentifier, spaceId)
      .query('DELETE FROM CustomSpaces WHERE Id = @spaceId');
    
    // Update pack's UpdatedAt
    await pool
      .request()
      .input('packId', sql.UniqueIdentifier, space.packId)
      .input('updatedAt', sql.DateTime2, now)
      .query('UPDATE CustomSpacePacks SET UpdatedAt = @updatedAt WHERE Id = @packId');
  } catch (error) {
    console.error('Error deleting custom space from database:', error);
    throw error;
  }
}

/**
 * Get all spaces from active packs
 */
export async function getActiveSpaces(): Promise<CustomSpace[]> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query<CustomSpaceRow>(`
        SELECT cs.* 
        FROM CustomSpaces cs
        INNER JOIN CustomSpacePacks csp ON cs.PackId = csp.Id
        WHERE csp.IsActive = 1
        ORDER BY cs.CreatedAt ASC
      `);
    
    return result.recordset.map(mapRowToCustomSpace);
  } catch (error) {
    console.error('Error getting active custom spaces from database:', error);
    throw error;
  }
}

/**
 * Get spaces by type from active packs
 */
export async function getActiveSpacesByType(type: CustomSpaceType): Promise<CustomSpace[]> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('type', sql.NVarChar(20), type)
      .query<CustomSpaceRow>(`
        SELECT cs.* 
        FROM CustomSpaces cs
        INNER JOIN CustomSpacePacks csp ON cs.PackId = csp.Id
        WHERE csp.IsActive = 1 AND cs.Type = @type
        ORDER BY cs.CreatedAt ASC
      `);
    
    return result.recordset.map(mapRowToCustomSpace);
  } catch (error) {
    console.error('Error getting active custom spaces by type from database:', error);
    throw error;
  }
}
