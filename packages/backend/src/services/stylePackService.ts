import { StylePack, StyleTheme } from '../models/types';
import { getInMemoryStore } from '../config/inMemoryStore';
import { v4 as uuidv4 } from 'uuid';

const store = getInMemoryStore();
const STYLE_PACKS_KEY = 'style:packs';
const ACTIVE_STYLE_KEY = 'style:active';

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
 * Initialize default style packs if they don't exist
 */
async function initializeDefaultPacks(): Promise<void> {
  // Directly check storage without calling getAllStylePacks to avoid recursion
  const packsJson = await store.get(STYLE_PACKS_KEY);
  
  if (!packsJson) {
    // Save all built-in packs directly
    await saveAllStylePacks(BUILT_IN_PACKS);
    // Set default as active
    await store.set(ACTIVE_STYLE_KEY, DEFAULT_STYLE_PACK.id);
  }
}

/**
 * Get all style packs
 */
export async function getAllStylePacks(): Promise<StylePack[]> {
  try {
    const packsJson = await store.get(STYLE_PACKS_KEY);
    
    if (packsJson) {
      const packs = JSON.parse(packsJson) as Array<Omit<StylePack, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }>;
      return packs.map((pack) => ({
        ...pack,
        createdAt: new Date(pack.createdAt),
        updatedAt: new Date(pack.updatedAt),
      }));
    }
    
    // Initialize with defaults if no packs exist
    await initializeDefaultPacks();
    return BUILT_IN_PACKS;
  } catch (error) {
    console.error('Error getting style packs:', error);
    return BUILT_IN_PACKS;
  }
}

/**
 * Get active style pack
 */
export async function getActiveStylePack(): Promise<StylePack> {
  try {
    const activeId = await store.get(ACTIVE_STYLE_KEY);
    const allPacks = await getAllStylePacks();
    
    if (activeId) {
      const activePack = allPacks.find(pack => pack.id === activeId);
      if (activePack) {
        return activePack;
      }
    }
    
    // Return default if no active pack found
    return allPacks.find(pack => pack.isDefault) || DEFAULT_STYLE_PACK;
  } catch (error) {
    console.error('Error getting active style pack:', error);
    return DEFAULT_STYLE_PACK;
  }
}

/**
 * Get style pack by ID
 */
export async function getStylePackById(id: string): Promise<StylePack | null> {
  try {
    const allPacks = await getAllStylePacks();
    return allPacks.find(pack => pack.id === id) || null;
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
    const newPack: StylePack = {
      id: uuidv4(),
      name,
      description,
      isActive: false,
      isDefault: false,
      theme,
      previewImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const allPacks = await getAllStylePacks();
    allPacks.push(newPack);
    await saveAllStylePacks(allPacks);
    
    return newPack;
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
    const allPacks = await getAllStylePacks();
    const packIndex = allPacks.findIndex(pack => pack.id === id);
    
    if (packIndex === -1) {
      throw new Error('Style pack not found');
    }
    
    const pack = allPacks[packIndex];
    
    // Don't allow changing isDefault for built-in packs
    if (pack.isDefault && updates.isActive !== undefined) {
      // Allow only activation changes for default pack
      updates = { isActive: updates.isActive };
    }
    
    const updatedPack: StylePack = {
      ...pack,
      ...updates,
      updatedAt: new Date(),
    };
    
    allPacks[packIndex] = updatedPack;
    await saveAllStylePacks(allPacks);
    
    return updatedPack;
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
    const allPacks = await getAllStylePacks();
    const pack = allPacks.find(p => p.id === id);
    
    if (!pack) {
      throw new Error('Style pack not found');
    }
    
    // Deactivate all packs and activate the selected one
    const updatedPacks = allPacks.map(p => ({
      ...p,
      isActive: p.id === id,
      updatedAt: p.id === id ? new Date() : p.updatedAt,
    }));
    
    await saveAllStylePacks(updatedPacks);
    await store.set(ACTIVE_STYLE_KEY, id);
    
    return updatedPacks.find(p => p.id === id)!;
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
    const allPacks = await getAllStylePacks();
    const pack = allPacks.find(p => p.id === id);
    
    if (!pack) {
      throw new Error('Style pack not found');
    }
    
    if (pack.isDefault) {
      throw new Error('Cannot delete built-in style pack');
    }
    
    if (pack.isActive) {
      throw new Error('Cannot delete active style pack. Please activate another pack first.');
    }
    
    const filteredPacks = allPacks.filter(p => p.id !== id);
    await saveAllStylePacks(filteredPacks);
  } catch (error) {
    console.error('Error deleting style pack:', error);
    throw error;
  }
}

/**
 * Internal: Save all style packs to storage
 */
async function saveAllStylePacks(packs: StylePack[]): Promise<void> {
  await store.set(STYLE_PACKS_KEY, JSON.stringify(packs));
}
