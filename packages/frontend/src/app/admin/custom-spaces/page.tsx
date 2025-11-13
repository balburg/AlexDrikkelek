'use client';

import { useEffect, useState } from 'react';
import { CustomSpacePack, CustomSpace, CustomSpaceType } from '@/types/game';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CustomSpacesPage() {
  const [packs, setPacks] = useState<CustomSpacePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [showPackModal, setShowPackModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [editingPack, setEditingPack] = useState<CustomSpacePack | null>(null);
  const [editingSpace, setEditingSpace] = useState<CustomSpace | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  
  // Form states
  const [packForm, setPackForm] = useState({
    name: '',
    description: '',
    isActive: false,
  });
  
  const [spaceForm, setSpaceForm] = useState({
    name: '',
    description: '',
    type: CustomSpaceType.CHALLENGE,
    logoUrl: '',
    backgroundUrl: '',
    imageUrl: '',
    backgroundColor: '',
    textColor: '',
  });

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/admin/custom-space-packs`);
      
      if (!response.ok) {
        throw new Error('Failed to load custom space packs');
      }

      const data = await response.json();
      setPacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePack = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/custom-space-packs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create pack');
      }

      setSuccessMessage('Pack created successfully! 🎉');
      setShowPackModal(false);
      setPackForm({ name: '', description: '', isActive: false });
      await loadPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pack');
    }
  };

  const handleUpdatePack = async () => {
    if (!editingPack) return;

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/custom-space-packs/${editingPack.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update pack');
      }

      setSuccessMessage('Pack updated successfully! ✅');
      setShowPackModal(false);
      setEditingPack(null);
      setPackForm({ name: '', description: '', isActive: false });
      await loadPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pack');
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!confirm('Are you sure you want to delete this pack? All spaces in this pack will also be deleted.')) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/custom-space-packs/${packId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete pack');
      }

      setSuccessMessage('Pack deleted successfully! 🗑️');
      await loadPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pack');
    }
  };

  const handleTogglePackActivation = async (packId: string, isActive: boolean) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/custom-space-packs/${packId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle pack activation');
      }

      setSuccessMessage(`Pack ${isActive ? 'activated' : 'deactivated'} successfully! 🔄`);
      await loadPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle pack activation');
    }
  };

  const handleCreateSpace = async () => {
    if (!selectedPackId) return;

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/custom-space-packs/${selectedPackId}/spaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create space');
      }

      setSuccessMessage('Space created successfully! 🎉');
      setShowSpaceModal(false);
      setSpaceForm({
        name: '',
        description: '',
        type: CustomSpaceType.CHALLENGE,
        logoUrl: '',
        backgroundUrl: '',
        imageUrl: '',
        backgroundColor: '',
        textColor: '',
      });
      await loadPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create space');
    }
  };

  const handleUpdateSpace = async () => {
    if (!editingSpace) return;

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/custom-spaces/${editingSpace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update space');
      }

      setSuccessMessage('Space updated successfully! ✅');
      setShowSpaceModal(false);
      setEditingSpace(null);
      setSpaceForm({
        name: '',
        description: '',
        type: CustomSpaceType.CHALLENGE,
        logoUrl: '',
        backgroundUrl: '',
        imageUrl: '',
        backgroundColor: '',
        textColor: '',
      });
      await loadPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update space');
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this space?')) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/admin/custom-spaces/${spaceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete space');
      }

      setSuccessMessage('Space deleted successfully! 🗑️');
      await loadPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete space');
    }
  };

  const openPackModal = (pack?: CustomSpacePack) => {
    if (pack) {
      setEditingPack(pack);
      setPackForm({
        name: pack.name,
        description: pack.description,
        isActive: pack.isActive,
      });
    } else {
      setEditingPack(null);
      setPackForm({ name: '', description: '', isActive: false });
    }
    setShowPackModal(true);
  };

  const openSpaceModal = (packId: string, space?: CustomSpace) => {
    setSelectedPackId(packId);
    if (space) {
      setEditingSpace(space);
      setSpaceForm({
        name: space.name,
        description: space.description,
        type: space.type,
        logoUrl: space.logoUrl || '',
        backgroundUrl: space.backgroundUrl || '',
        imageUrl: space.imageUrl || '',
        backgroundColor: space.backgroundColor || '',
        textColor: space.textColor || '',
      });
    } else {
      setEditingSpace(null);
      setSpaceForm({
        name: '',
        description: '',
        type: CustomSpaceType.CHALLENGE,
        logoUrl: '',
        backgroundUrl: '',
        imageUrl: '',
        backgroundColor: '',
        textColor: '',
      });
    }
    setShowSpaceModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Custom Spaces Management</h1>
          <p className="text-gray-600">Create and manage custom space packs for your board game</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Create Pack Button */}
        <div className="mb-6">
          <button
            onClick={() => openPackModal()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            + Create New Pack
          </button>
        </div>

        {/* Packs List */}
        <div className="space-y-6">
          {packs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No custom space packs yet. Create one to get started!</p>
            </div>
          ) : (
            packs.map((pack) => (
              <div key={pack.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{pack.name}</h2>
                    <p className="text-gray-600 mt-1">{pack.description}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        pack.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pack.isActive ? '✓ Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePackActivation(pack.id, !pack.isActive)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pack.isActive
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {pack.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openPackModal(pack)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePack(pack.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Spaces in Pack */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Spaces ({pack.spaces.length})
                    </h3>
                    <button
                      onClick={() => openSpaceModal(pack.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      + Add Space
                    </button>
                  </div>

                  {pack.spaces.length === 0 ? (
                    <p className="text-gray-500 italic">No spaces in this pack yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pack.spaces.map((space) => (
                        <div
                          key={space.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          style={{
                            backgroundColor: space.backgroundColor || '#ffffff',
                            color: space.textColor || '#000000',
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{space.name}</h4>
                              <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                {space.type}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openSpaceModal(pack.id, space)}
                                className="px-2 py-1 bg-blue-500 bg-opacity-70 text-white rounded text-xs hover:bg-opacity-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSpace(space.id)}
                                className="px-2 py-1 bg-red-500 bg-opacity-70 text-white rounded text-xs hover:bg-opacity-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-sm mt-2 opacity-90">{space.description}</p>
                          {space.imageUrl && (
                            <img
                              src={space.imageUrl}
                              alt={space.name}
                              className="mt-2 w-full h-24 object-cover rounded"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pack Modal */}
        {showPackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                {editingPack ? 'Edit Pack' : 'Create New Pack'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Name
                  </label>
                  <input
                    type="text"
                    value={packForm.name}
                    onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Party Pack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={packForm.description}
                    onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe this pack..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={packForm.isActive}
                    onChange={(e) => setPackForm({ ...packForm, isActive: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Activate this pack immediately
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPackModal(false);
                    setEditingPack(null);
                    setPackForm({ name: '', description: '', isActive: false });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingPack ? handleUpdatePack : handleCreatePack}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPack ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Space Modal */}
        {showSpaceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
              <h2 className="text-2xl font-bold mb-4">
                {editingSpace ? 'Edit Space' : 'Create New Space'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Space Name
                    </label>
                    <input
                      type="text"
                      value={spaceForm.name}
                      onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mystery Challenge"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={spaceForm.type}
                      onChange={(e) => setSpaceForm({ ...spaceForm, type: e.target.value as CustomSpaceType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.values(CustomSpaceType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={spaceForm.description}
                    onChange={(e) => setSpaceForm({ ...spaceForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe this space..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={spaceForm.backgroundColor}
                      onChange={(e) => setSpaceForm({ ...spaceForm, backgroundColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={spaceForm.textColor}
                      onChange={(e) => setSpaceForm({ ...spaceForm, textColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL (optional)
                  </label>
                  <input
                    type="url"
                    value={spaceForm.logoUrl}
                    onChange={(e) => setSpaceForm({ ...spaceForm, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={spaceForm.backgroundUrl}
                    onChange={(e) => setSpaceForm({ ...spaceForm, backgroundUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/background.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={spaceForm.imageUrl}
                    onChange={(e) => setSpaceForm({ ...spaceForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSpaceModal(false);
                    setEditingSpace(null);
                    setSelectedPackId(null);
                    setSpaceForm({
                      name: '',
                      description: '',
                      type: CustomSpaceType.CHALLENGE,
                      logoUrl: '',
                      backgroundUrl: '',
                      imageUrl: '',
                      backgroundColor: '',
                      textColor: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingSpace ? handleUpdateSpace : handleCreateSpace}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSpace ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
