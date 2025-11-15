'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const { token } = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('adminToken', token);
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-light-purple rounded-3xl p-8 shadow-game">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-primary mb-2">
              🔐 Admin Login
            </h1>
            <p className="text-gray-600">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl font-bold shadow-game">
              ❌ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border-4 border-primary rounded-xl text-lg font-semibold focus:outline-none focus:border-accent-orange"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-accent-green text-white font-black text-xl rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-game transform hover:scale-105 transition-all duration-300"
            >
              {loading ? 'Logging in... ⏳' : 'Login 🚀'}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Default credentials: admin / admin</p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-block text-primary font-bold text-lg hover:text-accent-blue transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
