'use client';

import { useEffect, useState } from 'react';
import { GameSettings, ChallengeDifficulty } from '@/types/game';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<GameSettings>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/admin/settings`);
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      setSettings(data);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      setSuccessMessage('Settings saved successfully! 🎉');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/settings/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      const resetSettings = await response.json();
      setSettings(resetSettings);
      setFormData(resetSettings);
      setSuccessMessage('Settings reset to defaults! 🔄');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof GameSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white text-2xl">Loading settings... ⚙️</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-white mb-4 drop-shadow-2xl">
            🔧 Admin Settings Dashboard
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg">
            Configure game settings for AlexDrikkelek
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl font-bold shadow-game">
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-2xl font-bold shadow-game">
            {successMessage}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-3xl p-8 shadow-game">
          <div className="space-y-6">
            {/* Max Players */}
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Max Players Per Room
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={formData.maxPlayersPerRoom ?? 10}
                onChange={(e) =>
                  handleInputChange('maxPlayersPerRoom', parseInt(e.target.value))
                }
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              />
              <p className="mt-1 text-sm text-gray-600">Range: 2-20 players</p>
            </div>

            {/* Min Players to Start */}
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Min Players to Start
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={formData.minPlayersToStart ?? 2}
                onChange={(e) =>
                  handleInputChange('minPlayersToStart', parseInt(e.target.value))
                }
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              />
              <p className="mt-1 text-sm text-gray-600">
                Minimum players required to start a game
              </p>
            </div>

            {/* Default Board Size */}
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Default Board Size
              </label>
              <input
                type="number"
                min="20"
                max="100"
                value={formData.defaultBoardSize ?? 50}
                onChange={(e) =>
                  handleInputChange('defaultBoardSize', parseInt(e.target.value))
                }
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              />
              <p className="mt-1 text-sm text-gray-600">Range: 20-100 tiles</p>
            </div>

            {/* Turn Timeout */}
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Turn Timeout (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={formData.turnTimeoutSeconds ?? 60}
                onChange={(e) =>
                  handleInputChange('turnTimeoutSeconds', parseInt(e.target.value))
                }
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              />
              <p className="mt-1 text-sm text-gray-600">Range: 10-300 seconds</p>
            </div>

            {/* Enable Challenges */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-lg font-bold text-primary">
                  Enable Challenges
                </label>
                <p className="text-sm text-gray-600">
                  Include challenge tiles in the game
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.enableChallenges ?? true}
                onChange={(e) =>
                  handleInputChange('enableChallenges', e.target.checked)
                }
                className="w-8 h-8 text-accent-orange focus:ring-accent-orange border-4 border-primary rounded"
              />
            </div>

            {/* Challenge Difficulty */}
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Challenge Difficulty
              </label>
              <select
                value={formData.challengeDifficulty ?? ChallengeDifficulty.MIXED}
                onChange={(e) =>
                  handleInputChange(
                    'challengeDifficulty',
                    e.target.value as ChallengeDifficulty
                  )
                }
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              >
                <option value={ChallengeDifficulty.EASY}>Easy</option>
                <option value={ChallengeDifficulty.MEDIUM}>Medium</option>
                <option value={ChallengeDifficulty.HARD}>Hard</option>
                <option value={ChallengeDifficulty.MIXED}>Mixed</option>
              </select>
            </div>

            {/* Allow Late Join */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-lg font-bold text-primary">
                  Allow Late Join
                </label>
                <p className="text-sm text-gray-600">
                  Allow players to join after game has started
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.allowLateJoin ?? false}
                onChange={(e) => handleInputChange('allowLateJoin', e.target.checked)}
                className="w-8 h-8 text-accent-orange focus:ring-accent-orange border-4 border-primary rounded"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-8 py-4 bg-accent-green text-white font-black text-xl rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-game transform hover:scale-105 transition-all duration-300"
            >
              {saving ? 'Saving... ⏳' : 'Save Settings 💾'}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex-1 px-8 py-4 bg-accent-orange text-white font-black text-xl rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-game transform hover:scale-105 transition-all duration-300"
            >
              Reset to Defaults 🔄
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center space-y-3">
            <div>
              <a
                href="/admin/styles"
                className="inline-block text-white bg-accent-orange px-6 py-3 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-game"
              >
                🎨 Manage Style Packs
              </a>
            </div>
            <div>
              <a
                href="/"
                className="inline-block text-primary font-bold text-lg hover:text-accent-blue transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>

          {/* Last Updated */}
          {settings?.updatedAt && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Last updated: {new Date(settings.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
