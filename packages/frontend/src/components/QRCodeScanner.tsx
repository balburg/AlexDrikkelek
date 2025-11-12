'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanning = async () => {
      try {
        setIsScanning(true);
        setError(null);

        await scanner.start(
          { facingMode: 'environment' }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Successfully scanned a QR code
            console.log('QR Code scanned:', decodedText);
            onScan(decodedText.toUpperCase());
            stopScanning();
          },
          (errorMessage) => {
            // Scanning error (usually no QR code in view)
            // We don't show these errors as they're expected
          }
        );
        setCameraPermission('granted');
      } catch (err) {
        console.error('Error starting QR scanner:', err);
        setIsScanning(false);
        setCameraPermission('denied');
        setError('Failed to access camera. Please ensure camera permissions are granted.');
      }
    };

    const stopScanning = async () => {
      if (scannerRef.current && isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
      setIsScanning(false);
    };

    startScanning();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner on close:', err);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-primary mb-2">Scan QR Code</h2>
          <p className="text-gray-600 font-semibold">
            Point your camera at the QR code displayed on the board
          </p>
        </div>

        {/* Scanner Area */}
        <div className="relative">
          <div id="qr-reader" className="rounded-xl overflow-hidden" />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-red-700 text-sm font-semibold text-center">
                {error}
              </p>
            </div>
          )}

          {cameraPermission === 'denied' && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <p className="text-yellow-700 text-sm font-semibold text-center">
                Please enable camera access in your browser settings and refresh the page.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
          <p className="text-blue-700 text-sm font-semibold text-center">
            📸 Position the QR code within the frame
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full btn-secondary text-xl py-4 rounded-2xl shadow-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
