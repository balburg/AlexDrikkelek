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
  // State for interrogation card reveal animation
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

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

  const handleCardClick = () => {
    if (!isRevealed && !isFlipping) {
      setIsFlipping(true);
      // After animation completes, reveal the challenge
      setTimeout(() => {
        setIsRevealed(true);
        setIsFlipping(false);
      }, 1000); // Match the animation duration
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {!isRevealed ? (
        /* Interrogation Card - Question Mark */
        <div 
          onClick={handleCardClick}
          className={`bg-gradient-to-br from-accent-blue via-accent-purple to-primary rounded-3xl shadow-2xl max-w-md w-full mx-auto cursor-pointer overflow-hidden ${
            isFlipping ? 'animate-card-flip' : 'animate-question-pulse'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardClick();
            }
          }}
          aria-label="Click to reveal challenge"
        >
          <div className="p-12 text-center">
            <div className="text-9xl mb-6 filter drop-shadow-2xl">❓</div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg mb-4">
              Mystery Challenge!
            </h2>
            <p className="text-xl font-bold text-white/90 drop-shadow">
              Tap to reveal your challenge
            </p>
            <div className="mt-8 animate-bounce">
              <div className="inline-block bg-white/20 rounded-full px-6 py-3 backdrop-blur-sm">
                <p className="text-lg font-bold text-white">👆 Tap Here 👆</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Revealed Challenge Card */
        <div className="bg-light-yellow rounded-3xl shadow-2xl max-w-md w-full mx-auto animate-scale-in overflow-hidden">
        {/* Compact Header */}
        <div className={`bg-gradient-to-r ${getChallengeColor()} p-5 text-center`}>
          <div className="text-6xl mb-2">{getChallengeIcon()}</div>
          <h2 className="text-2xl font-black text-white drop-shadow">
            {challenge.type}
          </h2>
        </div>

        {/* Challenge Content */}
        <div className="p-5 space-y-4">
          {challenge.type === ChallengeType.TRIVIA ? (
            <>
              {/* Trivia Question */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xl font-bold text-primary text-center leading-snug">
                  {challenge.question}
                </p>
              </div>

              {/* Answer Options - Larger touch targets */}
              <div className="space-y-3">
                {challenge.answers?.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full p-5 rounded-xl text-lg font-bold transition-all duration-200 border-4 ${
                      selectedAnswer === index
                        ? 'bg-accent-green text-white border-accent-green scale-105 shadow-xl'
                        : 'bg-white text-primary border-gray-300 hover:border-accent-blue active:scale-95'
                    }`}
                  >
                    <span className="mr-2 text-xl">{String.fromCharCode(65 + index)}.</span>
                    {answer}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Action/Dare/Drinking Challenge */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <p className="text-3xl font-black text-primary leading-tight">
                  {challenge.action}
                </p>
              </div>

              <div className="bg-accent-yellow/20 rounded-xl p-4 border-2 border-accent-yellow">
                <p className="text-center text-lg font-bold text-gray-700">
                  👉 Complete and tap Done! 👈
                </p>
              </div>
            </>
          )}

          {/* Points Display */}
          <div className="text-center py-2">
            <span className="inline-block bg-gradient-to-r from-accent-yellow to-accent-orange rounded-full px-5 py-2 text-xl font-black text-white">
              ⭐ {challenge.points} pts
            </span>
          </div>

          {/* Action Button - Large touch target */}
          <button
            onClick={handleSubmit}
            disabled={challenge.type === ChallengeType.TRIVIA && selectedAnswer === null}
            className={`w-full py-5 rounded-2xl text-2xl font-black transition-all duration-200 ${
              challenge.type === ChallengeType.TRIVIA && selectedAnswer === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-accent-green to-accent-blue text-white active:scale-95 shadow-xl'
            }`}
          >
            {challenge.type === ChallengeType.TRIVIA ? '✓ Submit' : '✓ Done!'}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
