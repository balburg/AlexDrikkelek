import { StylePack, StyleTheme } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import * as stylePackRepository from '../repositories/stylePackRepository';

/**
 * Default style packs (built-in themes)
 */
const DEFAULT_STYLE_PACK: StylePack = {
  id: 'default',
  name: 'Default',
  description: 'The original AlexDrikkelek vibrant theme',
  isActive: true,
  isDefault: true,
  theme: {
    primary: '#46178F',
    primaryLight: '#6938A5',
    primaryDark: '#2D0E5A',
    secondary: '#E21B3C',
    secondaryLight: '#FF4560',
    secondaryDark: '#B31530',
    accentBlue: '#1368CE',
    accentOrange: '#FF8C1A',
    accentGreen: '#26890D',
    accentYellow: '#FFD602',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CHRISTMAS_STYLE_PACK: StylePack = {
  id: 'christmas',
  name: 'Christmas',
  description: 'Festive red and green holiday theme',
  isActive: false,
  isDefault: false,
  theme: {
    primary: '#C41E3A',      // Christmas red
    primaryLight: '#E63946',
    primaryDark: '#8B0000',
    secondary: '#0F8B3C',    // Christmas green
    secondaryLight: '#28B463',
    secondaryDark: '#0A5A28',
    accentBlue: '#2E86AB',
    accentOrange: '#F77F00',
    accentGreen: '#06D6A0',
    accentYellow: '#FFD23F',
    background: 'linear-gradient(135deg, #C41E3A 0%, #0F8B3C 100%)',
    pattern: 'snowflakes',
  },
  previewImage: '/themes/christmas-preview.png',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const HALLOWEEN_STYLE_PACK: StylePack = {
  id: 'halloween',
  name: 'Halloween',
  description: 'Spooky orange and black theme',
  isActive: false,
  isDefault: false,
  theme: {
    primary: '#FF6F00',      // Pumpkin orange
    primaryLight: '#FF8F00',
    primaryDark: '#E65100',
    secondary: '#1A1A2E',    // Dark purple-black
    secondaryLight: '#2E2E4E',
    secondaryDark: '#0F0F1E',
    accentBlue: '#6A4C93',
    accentOrange: '#FF9E00',
    accentGreen: '#7CB342',
    accentYellow: '#FFC107',
    background: 'linear-gradient(135deg, #1A1A2E 0%, #FF6F00 100%)',
    pattern: 'spiders',
  },
  previewImage: '/themes/halloween-preview.png',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const BUILT_IN_PACKS = [DEFAULT_STYLE_PACK, CHRISTMAS_STYLE_PACK, HALLOWEEN_STYLE_PACK];

/**
 * Get all style packs
 */
export async function getAllStylePacks(): Promise<StylePack[]> {
  try {
    return await stylePackRepository.getAllStylePacks();
  } catch (error) {
    console.warn('Database unavailable, using built-in style packs as fallback:', 
      error instanceof Error ? error.message : 'Unknown error');
    // Return built-in packs as fallback
    return BUILT_IN_PACKS;
  }
}

/**
 * Get active style pack
 */
export async function getActiveStylePack(): Promise<StylePack> {
  try {
    const activePack = await stylePackRepository.getActiveStylePack();
    if (activePack) {
      return activePack;
    }
    
    // If no active pack, try to get default
    const defaultPack = await stylePackRepository.getDefaultStylePack();
    if (defaultPack) {
      return defaultPack;
    }
    
    // Fallback to built-in default
    return DEFAULT_STYLE_PACK;
  } catch (error) {
    console.warn('Database unavailable, using built-in default style pack as fallback:', 
      error instanceof Error ? error.message : 'Unknown error');
    return DEFAULT_STYLE_PACK;
  }
}

/**
 * Get style pack by ID
 */
export async function getStylePackById(id: string): Promise<StylePack | null> {
  try {
    return await stylePackRepository.getStylePackById(id);
  } catch (error) {
    console.error('Error getting style pack by ID:', error);
    return null;
  }
}

/**
 * Create a new style pack
 */
export async function createStylePack(
  name: string,
  description: string,
  theme: StyleTheme,
  previewImage?: string
): Promise<StylePack> {
  try {
    const id = uuidv4();
    return await stylePackRepository.createStylePack(id, name, description, theme, previewImage);
  } catch (error) {
    console.error('Error creating style pack:', error);
    throw error;
  }
}

/**
 * Update a style pack
 */
export async function updateStylePack(
  id: string,
  updates: Partial<Omit<StylePack, 'id' | 'createdAt' | 'isDefault'>>
): Promise<StylePack> {
  try {
    const pack = await stylePackRepository.getStylePackById(id);
    
    if (!pack) {
      throw new Error('Style pack not found');
    }
    
    // Don't allow changing isDefault for built-in packs
    if (pack.isDefault && updates.isActive === undefined) {
      throw new Error('Cannot modify default style pack');
    }
    
    // If isActive is being set, use activateStylePack instead
    if (updates.isActive) {
      return await activateStylePack(id);
    }
    
    return await stylePackRepository.updateStylePack(id, {
      name: updates.name,
      description: updates.description,
      theme: updates.theme,
      previewImage: updates.previewImage,
    });
  } catch (error) {
    console.error('Error updating style pack:', error);
    throw error;
  }
}

/**
 * Activate a style pack (deactivates all others)
 */
export async function activateStylePack(id: string): Promise<StylePack> {
  try {
    return await stylePackRepository.activateStylePack(id);
  } catch (error) {
    console.error('Error activating style pack:', error);
    throw error;
  }
}

/**
 * Delete a custom style pack (cannot delete built-in packs)
 */
export async function deleteStylePack(id: string): Promise<void> {
  try {
    const pack = await stylePackRepository.getStylePackById(id);
    
    if (!pack) {
      throw new Error('Style pack not found');
    }
    
    if (pack.isDefault) {
      throw new Error('Cannot delete built-in style pack');
    }
    
    if (pack.isActive) {
      throw new Error('Cannot delete active style pack. Please activate another pack first.');
    }
    
    await stylePackRepository.deleteStylePack(id);
  } catch (error) {
    console.error('Error deleting style pack:', error);
    throw error;
  }
}
