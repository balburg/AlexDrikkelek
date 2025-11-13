import { GameSettings, ChallengeDifficulty } from '../models/types';
import { getRedisClient } from '../config/redis';

const redis = getRedisClient();
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
    const settingsJson = await redis.get(SETTINGS_KEY);
    
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
    
    const newSettings: GameSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date(),
    };
    
    // Validate settings
    if (newSettings.maxPlayersPerRoom < 2 || newSettings.maxPlayersPerRoom > 20) {
      throw new Error('Max players must be between 2 and 20');
    }
    
    if (newSettings.defaultBoardSize < 20 || newSettings.defaultBoardSize > 100) {
      throw new Error('Board size must be between 20 and 100');
    }
    
    if (newSettings.minPlayersToStart < 2 || newSettings.minPlayersToStart > newSettings.maxPlayersPerRoom) {
      throw new Error('Min players must be between 2 and max players');
    }
    
    if (newSettings.turnTimeoutSeconds < 10 || newSettings.turnTimeoutSeconds > 300) {
      throw new Error('Turn timeout must be between 10 and 300 seconds');
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
 * Internal: Save settings to Redis
 */
async function saveSettings(settings: GameSettings): Promise<void> {
  await redis.set(SETTINGS_KEY, JSON.stringify(settings));
}
