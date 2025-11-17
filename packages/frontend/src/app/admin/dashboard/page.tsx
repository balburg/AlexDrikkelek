'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const dashboardItems = [
    {
      title: 'Game Settings',
      description: 'Configure game parameters and rules',
      icon: '⚙️',
      href: '/admin',
      color: 'bg-accent-blue',
    },
    {
      title: 'Challenges & Trivia',
      description: 'Manage challenge questions and trivia cards',
      icon: '🎯',
      href: '/admin/challenges',
      color: 'bg-accent-orange',
    },
    {
      title: 'Custom Spaces',
      description: 'Create and manage custom board spaces',
      icon: '🎨',
      href: '/admin/custom-spaces',
      color: 'bg-accent-green',
    },
    {
      title: 'Style Packs',
      description: 'Customize game themes and colors',
      icon: '🌈',
      href: '/admin/styles',
      color: 'bg-accent-yellow',
    },
    {
      title: 'Board Generator',
      description: 'Test procedural board generation',
      icon: '🎲',
      href: '/admin/board-generator',
      color: 'bg-purple-500',
    },
    {
      title: 'Game Statistics',
      description: 'View game data and analytics',
      icon: '📊',
      href: '/admin/statistics',
      color: 'bg-primary',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-white mb-4 drop-shadow-2xl">
            🎮 Admin Dashboard
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg">
            Manage your AlexDrikkelek game
          </p>
        </div>

        {/* Logout Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white font-bold text-lg rounded-full hover:bg-red-600 shadow-game transform hover:scale-105 transition-all duration-300"
          >
            Logout 🚪
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block bg-light-purple rounded-3xl p-8 shadow-game transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{item.icon}</div>
                <h2 className="text-2xl font-black text-primary mb-2">
                  {item.title}
                </h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-light-blue rounded-3xl p-8 shadow-game">
          <h2 className="text-3xl font-black text-primary mb-6 text-center">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-gray-600 mb-2">Need help?</p>
              <a
                href="/docs"
                className="inline-block px-6 py-3 bg-accent-blue text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
              >
                View Documentation 📖
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Test your game</p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-accent-green text-white font-bold rounded-full hover:bg-green-600 transition-colors"
              >
                Go to Game 🎮
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-2">View board display</p>
              <a
                href="/board"
                className="inline-block px-6 py-3 bg-accent-orange text-white font-bold rounded-full hover:bg-orange-600 transition-colors"
              >
                Open Board View 🎲
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
