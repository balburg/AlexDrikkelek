'use client';

import { Challenge, ChallengeType } from '@/types/game';
import { useState } from 'react';

interface ChallengeModalProps {
  challenge: Challenge;
  playerName: string;
  onComplete: (success: boolean, answer?: number) => void;
  onClose: () => void;
}

export default function ChallengeModal({
  challenge,
  playerName,
  onComplete,
  onClose,
}: ChallengeModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleSubmit = () => {
    if (challenge.type === ChallengeType.TRIVIA) {
      if (selectedAnswer !== null) {
        onComplete(true, selectedAnswer);
      }
    } else {
      // For action, dare, and drinking challenges, just mark as complete
      onComplete(true);
    }
  };

  const getChallengeIcon = () => {
    switch (challenge.type) {
      case ChallengeType.TRIVIA:
        return '🧠';
      case ChallengeType.ACTION:
        return '🎯';
      case ChallengeType.DARE:
        return '😈';
      case ChallengeType.DRINKING:
        return '🍺';
      default:
        return '🎲';
    }
  };

  const getChallengeColor = () => {
    switch (challenge.type) {
      case ChallengeType.TRIVIA:
        return 'from-accent-blue to-accent-green';
      case ChallengeType.ACTION:
        return 'from-accent-orange to-accent-yellow';
      case ChallengeType.DARE:
        return 'from-accent-purple to-accent-pink';
      case ChallengeType.DRINKING:
        return 'from-accent-red to-accent-orange';
      default:
        return 'from-primary to-secondary';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-game max-w-2xl w-full border-8 border-white animate-scale-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getChallengeColor()} p-6 -m-6 mb-6 rounded-t-2xl shadow-2xl`}>
          <div className="text-center">
            <div className="text-6xl mb-3 animate-bounce">{getChallengeIcon()}</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
              {challenge.type} Challenge!
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white/90 drop-shadow">
              {playerName}&apos;s Turn
            </p>
          </div>
        </div>

        {/* Challenge Content */}
        <div className="space-y-6">
          {challenge.type === ChallengeType.TRIVIA ? (
            <>
              {/* Trivia Question */}
              <div className="bg-gradient-to-br from-accent-blue/10 to-accent-green/10 rounded-2xl p-6 border-4 border-accent-blue">
                <p className="text-2xl font-bold text-primary text-center">
                  {challenge.question}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {challenge.answers?.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full p-4 rounded-xl text-xl font-bold transition-all duration-300 border-4 ${
                      selectedAnswer === index
                        ? 'bg-accent-green text-white border-accent-green scale-105 shadow-xl'
                        : 'bg-white text-primary border-gray-300 hover:border-accent-blue hover:scale-102'
                    }`}
                  >
                    <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
                    {answer}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Action/Dare/Drinking Challenge */}
              <div className={`bg-gradient-to-br ${getChallengeColor()} rounded-3xl p-10 border-8 border-white shadow-2xl animate-pulse-slow`}>
                <div className="bg-white rounded-2xl p-8 shadow-inner">
                  <p className="text-5xl md:text-6xl font-black text-primary text-center leading-tight">
                    {challenge.action}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-accent-yellow to-accent-orange rounded-2xl p-6 border-4 border-white shadow-xl">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">👉</span>
                  <p className="text-center text-2xl font-black text-white">
                    Complete and click &quot;Done&quot;!
                  </p>
                  <span className="text-3xl">👈</span>
                </div>
              </div>
            </>
          )}

          {/* Points Display */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-accent-yellow to-accent-orange rounded-full px-6 py-3">
              <p className="text-2xl font-black text-white">
                ⭐ {challenge.points} Points
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={challenge.type === ChallengeType.TRIVIA && selectedAnswer === null}
              className={`flex-1 py-4 rounded-xl text-xl font-black transition-all duration-300 ${
                challenge.type === ChallengeType.TRIVIA && selectedAnswer === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent-green to-accent-blue text-white hover:scale-105 shadow-game'
              }`}
            >
              {challenge.type === ChallengeType.TRIVIA ? '✓ Submit Answer' : '✓ Done!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
