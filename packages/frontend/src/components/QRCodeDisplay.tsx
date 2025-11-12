'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  roomCode: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ roomCode, size = 200, className = '' }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !roomCode) return;

    const generateQRCode = async () => {
      try {
        // Generate QR code with the room code
        await QRCode.toCanvas(canvasRef.current, roomCode, {
          width: size,
          margin: 2,
          color: {
            dark: '#1e3a8a', // primary color
            light: '#ffffff',
          },
        });
        setError(null);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      }
    };

    generateQRCode();
  }, [roomCode, size]);

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <p className="text-red-500 text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  );
}
