'use client';

import { useEffect, useState } from 'react';
import { StylePack, StyleTheme } from '@/types/game';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function StylePacksPage() {
  const [stylePacks, setStylePacks] = useState<StylePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating new style pack
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  const [newPackTheme, setNewPackTheme] = useState<StyleTheme>({
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
  });

  useEffect(() => {
    loadStylePacks();
  }, []);

  const loadStylePacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/admin/style-packs`);
      
      if (!response.ok) {
        throw new Error('Failed to load style packs');
      }

      const data = await response.json();
      setStylePacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load style packs');
    } finally {
      setLoading(false);
    }
  };

  const activateStylePack = async (id: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/style-packs/${id}/activate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate style pack');
      }

      setSuccessMessage('Style pack activated successfully! 🎨');
      await loadStylePacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate style pack');
    }
  };

  const deleteStylePack = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/style-packs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete style pack');
      }

      setSuccessMessage('Style pack deleted successfully! 🗑️');
      await loadStylePacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete style pack');
    }
  };

  const createStylePack = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      if (!newPackName.trim()) {
        setError('Please enter a name for the style pack');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/style-packs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPackName,
          description: newPackDescription,
          theme: newPackTheme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create style pack');
      }

      setSuccessMessage('Style pack created successfully! 🎉');
      setShowCreateForm(false);
      setNewPackName('');
      setNewPackDescription('');
      await loadStylePacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create style pack');
    }
  };

  const updateThemeColor = (field: keyof StyleTheme, value: string) => {
    setNewPackTheme((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white text-2xl">Loading style packs... 🎨</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-white mb-4 drop-shadow-2xl">
            🎨 Style Pack Manager
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg">
            Activate, customize, and manage themes for your game
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

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4 justify-between items-center">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-accent-green text-white font-bold text-lg rounded-full hover:bg-green-600 shadow-game transform hover:scale-105 transition-all duration-300"
          >
            {showCreateForm ? '❌ Cancel' : '➕ Create New Style Pack'}
          </button>
          <a
            href="/admin"
            className="px-6 py-3 bg-white text-primary font-bold text-lg rounded-full hover:bg-gray-100 shadow-game transform hover:scale-105 transition-all duration-300"
          >
            ← Back to Settings
          </a>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-3xl p-8 shadow-game">
            <h2 className="text-3xl font-black text-primary mb-6">Create Custom Style Pack</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-lg font-bold text-primary mb-2">Name</label>
                <input
                  type="text"
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  placeholder="e.g., Summer Vibes"
                  className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-primary mb-2">Description</label>
                <textarea
                  value={newPackDescription}
                  onChange={(e) => setNewPackDescription(e.target.value)}
                  placeholder="Describe this style pack..."
                  rows={3}
                  className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={newPackTheme.primary}
                    onChange={(e) => updateThemeColor('primary', e.target.value)}
                    className="w-full h-12 border-4 border-primary rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={newPackTheme.secondary}
                    onChange={(e) => updateThemeColor('secondary', e.target.value)}
                    className="w-full h-12 border-4 border-primary rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Accent Blue</label>
                  <input
                    type="color"
                    value={newPackTheme.accentBlue}
                    onChange={(e) => updateThemeColor('accentBlue', e.target.value)}
                    className="w-full h-12 border-4 border-primary rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Accent Orange</label>
                  <input
                    type="color"
                    value={newPackTheme.accentOrange}
                    onChange={(e) => updateThemeColor('accentOrange', e.target.value)}
                    className="w-full h-12 border-4 border-primary rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Accent Green</label>
                  <input
                    type="color"
                    value={newPackTheme.accentGreen}
                    onChange={(e) => updateThemeColor('accentGreen', e.target.value)}
                    className="w-full h-12 border-4 border-primary rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Accent Yellow</label>
                  <input
                    type="color"
                    value={newPackTheme.accentYellow}
                    onChange={(e) => updateThemeColor('accentYellow', e.target.value)}
                    className="w-full h-12 border-4 border-primary rounded-xl cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={createStylePack}
              className="w-full px-8 py-4 bg-accent-green text-white font-black text-xl rounded-full hover:bg-green-600 shadow-game transform hover:scale-105 transition-all duration-300"
            >
              Create Style Pack 🎨
            </button>
          </div>
        )}

        {/* Style Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stylePacks.map((pack) => (
            <div
              key={pack.id}
              className={`bg-white rounded-3xl p-6 shadow-game transform transition-all duration-300 hover:scale-105 ${
                pack.isActive ? 'ring-4 ring-accent-green' : ''
              }`}
            >
              {/* Active Badge */}
              {pack.isActive && (
                <div className="mb-3 inline-block px-4 py-1 bg-accent-green text-white text-sm font-bold rounded-full">
                  ✓ ACTIVE
                </div>
              )}

              {/* Default Badge */}
              {pack.isDefault && (
                <div className="mb-3 inline-block px-4 py-1 bg-accent-blue text-white text-sm font-bold rounded-full ml-2">
                  🏠 BUILT-IN
                </div>
              )}

              <h3 className="text-2xl font-black text-primary mb-2">{pack.name}</h3>
              <p className="text-gray-600 mb-4">{pack.description}</p>

              {/* Color Preview */}
              <div className="mb-4 grid grid-cols-5 gap-2">
                <div
                  className="h-10 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: pack.theme.primary }}
                  title="Primary"
                />
                <div
                  className="h-10 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: pack.theme.secondary }}
                  title="Secondary"
                />
                <div
                  className="h-10 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: pack.theme.accentBlue }}
                  title="Blue"
                />
                <div
                  className="h-10 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: pack.theme.accentOrange }}
                  title="Orange"
                />
                <div
                  className="h-10 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: pack.theme.accentGreen }}
                  title="Green"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {!pack.isActive && (
                  <button
                    onClick={() => activateStylePack(pack.id)}
                    className="w-full px-4 py-2 bg-accent-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Activate 🎨
                  </button>
                )}
                {!pack.isDefault && (
                  <button
                    onClick={() => deleteStylePack(pack.id, pack.name)}
                    disabled={pack.isActive}
                    className="w-full px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete 🗑️
                  </button>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Updated: {new Date(pack.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
