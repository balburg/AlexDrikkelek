'use client';

import { Player } from '@/types/game';
import { useEffect, useState } from 'react';

interface WinnerCelebrationProps {
  winner: Player;
  onFinishGame: () => void;
}

interface Crown {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export default function WinnerCelebration({ winner, onFinishGame }: WinnerCelebrationProps) {
  const [crowns, setCrowns] = useState<Crown[]>([]);

  useEffect(() => {
    // Generate random crowns for rain effect
    const crownArray: Crown[] = [];
    for (let i = 0; i < 50; i++) {
      crownArray.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      });
    }
    setCrowns(crownArray);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      {/* Crown Rain Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {crowns.map((crown) => (
          <div
            key={crown.id}
            className="absolute text-4xl animate-fall"
            style={{
              left: `${crown.left}%`,
              top: '-10%',
              animationDelay: `${crown.delay}s`,
              animationDuration: `${crown.duration}s`,
            }}
          >
            👑
          </div>
        ))}
      </div>

      {/* Winner Card */}
      <div className="relative bg-gradient-to-br from-accent-yellow via-yellow-300 to-accent-orange rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-in">
        {/* Celebration Emoji */}
        <div className="text-6xl mb-4 animate-pulse">
          🎉
        </div>

        {/* Winner Avatar */}
        <div className="mb-4">
          {winner.avatar && (
            <div className="text-8xl mb-2 animate-wiggle">
              {winner.avatar}
            </div>
          )}
        </div>

        {/* Winner Name */}
        <h1 className="text-5xl font-black text-primary mb-2 drop-shadow-lg animate-pulse">
          {winner.name}
        </h1>
        <h2 className="text-3xl font-bold text-secondary mb-6">
          Wins! 🏆
        </h2>

        {/* Confetti Emojis */}
        <div className="text-4xl mb-8 space-x-2">
          <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>🎊</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.3s' }}>🎈</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</span>
        </div>

        {/* Finish Game Button */}
        <button
          onClick={onFinishGame}
          className="w-full btn-primary text-2xl py-5 rounded-2xl shadow-xl hover:scale-105 transform transition-all"
        >
          <span className="block text-3xl mb-1">🏁</span>
          Finish the Game
        </button>

        <p className="text-sm text-gray-600 mt-4">
          Return to lobby and start a new game
        </p>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.8;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
