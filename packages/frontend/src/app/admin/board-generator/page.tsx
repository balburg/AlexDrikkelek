'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Board from '@/components/Board';
import { BoardState, Player } from '@/types/game';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BoardGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<BoardState | null>(null);
  const [seed, setSeed] = useState('');
  const [boardSize, setBoardSize] = useState(50);
  const [generationHistory, setGenerationHistory] = useState<Array<{ seed: string; size: number; timestamp: number }>>([]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`,
    };
  };

  const generateBoard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/generate-board`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          seed: seed.trim() || undefined,
          boardSize: boardSize,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate board');
      }

      const data = await response.json();
      setBoard(data);
      
      // Add to history
      setGenerationHistory(prev => [{
        seed: data.seed,
        size: data.tiles.length,
        timestamp: Date.now(),
      }, ...prev.slice(0, 9)]); // Keep last 10 generations
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate board');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomBoard = () => {
    setSeed('');
    generateBoard();
  };

  const handlePreviousSeed = (previousSeed: string) => {
    setSeed(previousSeed);
  };

  // Empty players array for board visualization
  const emptyPlayers: Player[] = [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-white mb-4 drop-shadow-2xl">
            🎲 Procedural Board Generator
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg">
            Test and visualize procedurally generated game boards
          </p>
        </div>

        {/* Navigation Links */}
        <div className="mb-6 flex gap-4 justify-center flex-wrap">
          <a
            href="/admin/dashboard"
            className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold shadow-game hover:shadow-xl transition-all"
          >
            🏠 Dashboard
          </a>
          <a
            href="/admin"
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-game hover:shadow-xl transition-all"
          >
            ⚙️ Settings
          </a>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl font-bold shadow-game">
            ❌ {error}
          </div>
        )}

        {/* Generator Controls */}
        <div className="mb-8 bg-light-purple rounded-3xl p-8 shadow-game">
          <h2 className="text-3xl font-black text-primary mb-6">Generation Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Seed Input */}
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Seed (optional)
              </label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Leave empty for random"
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              />
              <p className="mt-1 text-sm text-gray-600">
                Same seed = same board. Leave empty for random generation.
              </p>
            </div>

            {/* Board Size Input */}
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Board Size: {boardSize} tiles
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={boardSize}
                onChange={(e) => setBoardSize(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>20 tiles (Short)</span>
                <span>100 tiles (Long)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={generateBoard}
              disabled={loading}
              className="flex-1 px-8 py-4 bg-accent-green text-white font-black text-xl rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-game transform hover:scale-105 transition-all duration-300"
            >
              {loading ? 'Generating... ⏳' : 'Generate Board 🎲'}
            </button>
            <button
              onClick={generateRandomBoard}
              disabled={loading}
              className="flex-1 px-8 py-4 bg-accent-orange text-white font-black text-xl rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-game transform hover:scale-105 transition-all duration-300"
            >
              Random Board 🎰
            </button>
          </div>
        </div>

        {/* Generation History */}
        {generationHistory.length > 0 && (
          <div className="mb-8 bg-light-blue rounded-3xl p-8 shadow-game">
            <h2 className="text-3xl font-black text-primary mb-6">Generation History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generationHistory.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePreviousSeed(item.seed)}
                >
                  <div className="font-bold text-primary mb-2">
                    Board #{generationHistory.length - index}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Seed: <span className="font-mono text-xs">{item.seed.substring(0, 30)}{item.seed.length > 30 ? '...' : ''}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Size: {item.size} tiles
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Board Display */}
        {board && (
          <div className="bg-light-purple rounded-3xl p-8 shadow-game">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-primary mb-2">Generated Board</h2>
              <div className="text-lg text-gray-700">
                <div className="font-bold">Seed: <span className="font-mono text-accent-blue">{board.seed}</span></div>
                <div className="font-bold">Total Tiles: {board.tiles.length}</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 text-sm">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🏁</div>
                    <div className="font-bold">Start</div>
                    <div className="text-gray-600">{board.tiles.filter(t => t.type === 'START').length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">❓</div>
                    <div className="font-bold">Challenge</div>
                    <div className="text-gray-600">{board.tiles.filter(t => t.type === 'CHALLENGE').length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="font-bold">Bonus</div>
                    <div className="text-gray-600">{board.tiles.filter(t => t.type === 'BONUS').length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">💀</div>
                    <div className="font-bold">Penalty</div>
                    <div className="text-gray-600">{board.tiles.filter(t => t.type === 'PENALTY').length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="font-bold">Finish</div>
                    <div className="text-gray-600">{board.tiles.filter(t => t.type === 'FINISH').length}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 overflow-auto">
              <Board board={board} players={emptyPlayers} />
            </div>

            {/* Copy Seed Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(board.seed);
                  alert('Seed copied to clipboard!');
                }}
                className="px-6 py-3 bg-accent-blue text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-game"
              >
                📋 Copy Seed
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!board && !loading && (
          <div className="bg-light-blue rounded-3xl p-8 shadow-game text-center">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-2xl font-black text-primary mb-4">
              Ready to Generate a Board?
            </h3>
            <p className="text-lg text-gray-700 mb-2">
              Click &quot;Generate Board&quot; to create a new procedural board with the current settings.
            </p>
            <p className="text-gray-600">
              Use a specific seed for reproducible boards, or leave it empty for random generation.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
