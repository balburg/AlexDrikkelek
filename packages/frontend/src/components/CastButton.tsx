'use client';

import { useCast } from '@/lib/useCast';

interface CastButtonProps {
  roomCode: string;
  className?: string;
}

export default function CastButton({ roomCode, className = '' }: CastButtonProps) {
  const { isAvailable, isCasting, startCasting, stopCasting } = useCast(roomCode);

  // Don't show button if casting is not available
  if (!isAvailable) {
    return null;
  }

  const handleClick = () => {
    if (isCasting) {
      stopCasting();
    } else {
      startCasting();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
        isCasting
          ? 'bg-accent-green text-white hover:bg-green-600'
          : 'bg-accent-blue text-white hover:bg-blue-600'
      } ${className}`}
    >
      <span className="text-2xl">{isCasting ? '📺' : '📡'}</span>
      <span>{isCasting ? 'Stop Casting' : 'Cast to TV'}</span>
    </button>
  );
}
