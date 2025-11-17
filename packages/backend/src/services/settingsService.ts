import { GameSettings, ChallengeDifficulty } from '../models/types';
import { getInMemoryStore } from '../config/inMemoryStore';

const store = getInMemoryStore();
const SETTINGS_KEY = 'game:settings';

/**
 * Default game settings
 */
const DEFAULT_SETTINGS: GameSettings = {
  maxPlayersPerRoom: 10,
  defaultBoardSize: 50,
  enableChallenges: true,
  challengeDifficulty: ChallengeDifficulty.MIXED,
  turnTimeoutSeconds: 60,
  allowLateJoin: false,
  minPlayersToStart: 2,
  updatedAt: new Date(),
};

/**
 * Get current game settings
 */
export async function getSettings(): Promise<GameSettings> {
  try {
    const settingsJson = await store.get(SETTINGS_KEY);
    
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      // Convert updatedAt back to Date object
      settings.updatedAt = new Date(settings.updatedAt);
      return settings;
    }
    
    // If no settings exist, return defaults and save them
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update game settings
 */
export async function updateSettings(updates: Partial<GameSettings>): Promise<GameSettings> {
  try {
    const currentSettings = await getSettings();
    
    // Validate and sanitize incoming updates
    const validatedUpdates: Partial<GameSettings> = {};
    
    if (updates.maxPlayersPerRoom !== undefined) {
      const value = Number(updates.maxPlayersPerRoom);
      if (isNaN(value) || value < 2 || value > 20) {
        throw new Error('Max players must be between 2 and 20');
      }
      validatedUpdates.maxPlayersPerRoom = value;
    }
    
    if (updates.defaultBoardSize !== undefined) {
      const value = Number(updates.defaultBoardSize);
      if (isNaN(value) || value < 20 || value > 100) {
        throw new Error('Board size must be between 20 and 100');
      }
      validatedUpdates.defaultBoardSize = value;
    }
    
    if (updates.minPlayersToStart !== undefined) {
      const value = Number(updates.minPlayersToStart);
      if (isNaN(value) || value < 2) {
        throw new Error('Min players must be at least 2');
      }
      validatedUpdates.minPlayersToStart = value;
    }
    
    if (updates.turnTimeoutSeconds !== undefined) {
      const value = Number(updates.turnTimeoutSeconds);
      if (isNaN(value) || value < 10 || value > 300) {
        throw new Error('Turn timeout must be between 10 and 300 seconds');
      }
      validatedUpdates.turnTimeoutSeconds = value;
    }
    
    if (updates.enableChallenges !== undefined) {
      validatedUpdates.enableChallenges = Boolean(updates.enableChallenges);
    }
    
    if (updates.allowLateJoin !== undefined) {
      validatedUpdates.allowLateJoin = Boolean(updates.allowLateJoin);
    }
    
    if (updates.challengeDifficulty !== undefined) {
      const validDifficulties = Object.values(ChallengeDifficulty);
      if (!validDifficulties.includes(updates.challengeDifficulty)) {
        throw new Error('Invalid challenge difficulty');
      }
      validatedUpdates.challengeDifficulty = updates.challengeDifficulty;
    }
    
    const newSettings: GameSettings = {
      ...currentSettings,
      ...validatedUpdates,
      updatedAt: new Date(),
    };
    
    // Final cross-field validation
    if (newSettings.minPlayersToStart > newSettings.maxPlayersPerRoom) {
      throw new Error('Min players must not exceed max players');
    }
    
    await saveSettings(newSettings);
    return newSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<GameSettings> {
  const newDefaults = {
    ...DEFAULT_SETTINGS,
    updatedAt: new Date(),
  };
  await saveSettings(newDefaults);
  return newDefaults;
}

/**
 * Internal: Save settings to storage
 */
async function saveSettings(settings: GameSettings): Promise<void> {
  await store.set(SETTINGS_KEY, JSON.stringify(settings));
}
