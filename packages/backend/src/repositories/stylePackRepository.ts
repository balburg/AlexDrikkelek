import { sql, getConnection } from '../config/database';
import { StylePack, StyleTheme } from '../models/types';

/**
 * StylePack Repository
 * Handles all database operations for StylePacks
 */

interface StylePackRow {
  Id: string;
  Name: string;
  Description: string;
  IsActive: boolean;
  IsDefault: boolean;
  ThemePrimary: string;
  ThemePrimaryLight: string;
  ThemePrimaryDark: string;
  ThemeSecondary: string;
  ThemeSecondaryLight: string;
  ThemeSecondaryDark: string;
  ThemeAccentBlue: string;
  ThemeAccentOrange: string;
  ThemeAccentGreen: string;
  ThemeAccentYellow: string;
  ThemeBackground: string | null;
  ThemePattern: string | null;
  PreviewImage: string | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

/**
 * Convert database row to StylePack model
 */
function mapRowToStylePack(row: StylePackRow): StylePack {
  return {
    id: row.Id,
    name: row.Name,
    description: row.Description,
    isActive: row.IsActive,
    isDefault: row.IsDefault,
    theme: {
      primary: row.ThemePrimary,
      primaryLight: row.ThemePrimaryLight,
      primaryDark: row.ThemePrimaryDark,
      secondary: row.ThemeSecondary,
      secondaryLight: row.ThemeSecondaryLight,
      secondaryDark: row.ThemeSecondaryDark,
      accentBlue: row.ThemeAccentBlue,
      accentOrange: row.ThemeAccentOrange,
      accentGreen: row.ThemeAccentGreen,
      accentYellow: row.ThemeAccentYellow,
      background: row.ThemeBackground || undefined,
      pattern: row.ThemePattern || undefined,
    },
    previewImage: row.PreviewImage || undefined,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

/**
 * Get all style packs from the database
 */
export async function getAllStylePacks(): Promise<StylePack[]> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query<StylePackRow>('SELECT * FROM StylePacks ORDER BY CreatedAt DESC');
    
    return result.recordset.map(mapRowToStylePack);
  } catch (error) {
    // Log at debug level since service layer will handle fallback
    console.debug('Database query failed in getAllStylePacks:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get active style pack from the database
 */
export async function getActiveStylePack(): Promise<StylePack | null> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query<StylePackRow>('SELECT TOP 1 * FROM StylePacks WHERE IsActive = 1');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return mapRowToStylePack(result.recordset[0]);
  } catch (error) {
    // Log at debug level since service layer will handle fallback
    console.debug('Database query failed in getActiveStylePack:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get style pack by ID from the database
 */
export async function getStylePackById(id: string): Promise<StylePack | null> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query<StylePackRow>('SELECT * FROM StylePacks WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return mapRowToStylePack(result.recordset[0]);
  } catch (error) {
    // Log at debug level since service layer will handle fallback
    console.debug('Database query failed in getStylePackById:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Create a new style pack in the database
 */
export async function createStylePack(
  id: string,
  name: string,
  description: string,
  theme: StyleTheme,
  previewImage?: string
): Promise<StylePack> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(100), name)
      .input('description', sql.NVarChar(500), description)
      .input('isActive', sql.Bit, false)
      .input('isDefault', sql.Bit, false)
      .input('themePrimary', sql.NVarChar(20), theme.primary)
      .input('themePrimaryLight', sql.NVarChar(20), theme.primaryLight)
      .input('themePrimaryDark', sql.NVarChar(20), theme.primaryDark)
      .input('themeSecondary', sql.NVarChar(20), theme.secondary)
      .input('themeSecondaryLight', sql.NVarChar(20), theme.secondaryLight)
      .input('themeSecondaryDark', sql.NVarChar(20), theme.secondaryDark)
      .input('themeAccentBlue', sql.NVarChar(20), theme.accentBlue)
      .input('themeAccentOrange', sql.NVarChar(20), theme.accentOrange)
      .input('themeAccentGreen', sql.NVarChar(20), theme.accentGreen)
      .input('themeAccentYellow', sql.NVarChar(20), theme.accentYellow)
      .input('themeBackground', sql.NVarChar(500), theme.background || null)
      .input('themePattern', sql.NVarChar(100), theme.pattern || null)
      .input('previewImage', sql.NVarChar(500), previewImage || null)
      .input('createdAt', sql.DateTime2, now)
      .input('updatedAt', sql.DateTime2, now)
      .query(`
        INSERT INTO StylePacks (
          Id, Name, Description, IsActive, IsDefault,
          ThemePrimary, ThemePrimaryLight, ThemePrimaryDark,
          ThemeSecondary, ThemeSecondaryLight, ThemeSecondaryDark,
          ThemeAccentBlue, ThemeAccentOrange, ThemeAccentGreen, ThemeAccentYellow,
          ThemeBackground, ThemePattern, PreviewImage,
          CreatedAt, UpdatedAt
        ) VALUES (
          @id, @name, @description, @isActive, @isDefault,
          @themePrimary, @themePrimaryLight, @themePrimaryDark,
          @themeSecondary, @themeSecondaryLight, @themeSecondaryDark,
          @themeAccentBlue, @themeAccentOrange, @themeAccentGreen, @themeAccentYellow,
          @themeBackground, @themePattern, @previewImage,
          @createdAt, @updatedAt
        )
      `);
    
    return {
      id,
      name,
      description,
      isActive: false,
      isDefault: false,
      theme,
      previewImage,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating style pack in database:', error);
    throw error;
  }
}

/**
 * Update a style pack in the database
 */
export async function updateStylePack(
  id: string,
  updates: {
    name?: string;
    description?: string;
    theme?: StyleTheme;
    previewImage?: string;
  }
): Promise<StylePack> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    // Build dynamic update query
    const setParts: string[] = [];
    const request = pool.request();
    request.input('id', sql.UniqueIdentifier, id);
    
    if (updates.name !== undefined) {
      setParts.push('Name = @name');
      request.input('name', sql.NVarChar(100), updates.name);
    }
    
    if (updates.description !== undefined) {
      setParts.push('Description = @description');
      request.input('description', sql.NVarChar(500), updates.description);
    }
    
    if (updates.theme) {
      setParts.push('ThemePrimary = @themePrimary');
      setParts.push('ThemePrimaryLight = @themePrimaryLight');
      setParts.push('ThemePrimaryDark = @themePrimaryDark');
      setParts.push('ThemeSecondary = @themeSecondary');
      setParts.push('ThemeSecondaryLight = @themeSecondaryLight');
      setParts.push('ThemeSecondaryDark = @themeSecondaryDark');
      setParts.push('ThemeAccentBlue = @themeAccentBlue');
      setParts.push('ThemeAccentOrange = @themeAccentOrange');
      setParts.push('ThemeAccentGreen = @themeAccentGreen');
      setParts.push('ThemeAccentYellow = @themeAccentYellow');
      setParts.push('ThemeBackground = @themeBackground');
      setParts.push('ThemePattern = @themePattern');
      
      request.input('themePrimary', sql.NVarChar(20), updates.theme.primary);
      request.input('themePrimaryLight', sql.NVarChar(20), updates.theme.primaryLight);
      request.input('themePrimaryDark', sql.NVarChar(20), updates.theme.primaryDark);
      request.input('themeSecondary', sql.NVarChar(20), updates.theme.secondary);
      request.input('themeSecondaryLight', sql.NVarChar(20), updates.theme.secondaryLight);
      request.input('themeSecondaryDark', sql.NVarChar(20), updates.theme.secondaryDark);
      request.input('themeAccentBlue', sql.NVarChar(20), updates.theme.accentBlue);
      request.input('themeAccentOrange', sql.NVarChar(20), updates.theme.accentOrange);
      request.input('themeAccentGreen', sql.NVarChar(20), updates.theme.accentGreen);
      request.input('themeAccentYellow', sql.NVarChar(20), updates.theme.accentYellow);
      request.input('themeBackground', sql.NVarChar(500), updates.theme.background || null);
      request.input('themePattern', sql.NVarChar(100), updates.theme.pattern || null);
    }
    
    if (updates.previewImage !== undefined) {
      setParts.push('PreviewImage = @previewImage');
      request.input('previewImage', sql.NVarChar(500), updates.previewImage || null);
    }
    
    setParts.push('UpdatedAt = @updatedAt');
    request.input('updatedAt', sql.DateTime2, now);
    
    if (setParts.length === 1) {
      // Only updatedAt, no actual changes
      const existing = await getStylePackById(id);
      if (!existing) {
        throw new Error('Style pack not found');
      }
      return existing;
    }
    
    await request.query(`UPDATE StylePacks SET ${setParts.join(', ')} WHERE Id = @id`);
    
    const updated = await getStylePackById(id);
    if (!updated) {
      throw new Error('Style pack not found after update');
    }
    
    return updated;
  } catch (error) {
    console.error('Error updating style pack in database:', error);
    throw error;
  }
}

/**
 * Activate a style pack (deactivates all others)
 */
export async function activateStylePack(id: string): Promise<StylePack> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    // Deactivate all style packs first
    await pool.request().query('UPDATE StylePacks SET IsActive = 0');
    
    // Activate the specified style pack
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('updatedAt', sql.DateTime2, now)
      .query('UPDATE StylePacks SET IsActive = 1, UpdatedAt = @updatedAt WHERE Id = @id');
    
    const activated = await getStylePackById(id);
    if (!activated) {
      throw new Error('Style pack not found after activation');
    }
    
    return activated;
  } catch (error) {
    console.error('Error activating style pack in database:', error);
    throw error;
  }
}

/**
 * Delete a style pack from the database
 */
export async function deleteStylePack(id: string): Promise<void> {
  try {
    const pool = await getConnection();
    
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query('DELETE FROM StylePacks WHERE Id = @id');
  } catch (error) {
    console.error('Error deleting style pack from database:', error);
    throw error;
  }
}

/**
 * Get the default style pack
 */
export async function getDefaultStylePack(): Promise<StylePack | null> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query<StylePackRow>('SELECT TOP 1 * FROM StylePacks WHERE IsDefault = 1');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return mapRowToStylePack(result.recordset[0]);
  } catch (error) {
    // Log at debug level since service layer will handle fallback
    console.debug('Database query failed in getDefaultStylePack:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
