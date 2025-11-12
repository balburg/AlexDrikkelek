'use client';

import { useState, useEffect, useCallback } from 'react';

interface PresentationConnection {
  state: string;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  close(): void;
  terminate(): void;
}

interface PresentationRequest {
  start(): Promise<PresentationConnection>;
  getAvailability(): Promise<{ value: boolean }>;
}

declare global {
  interface Navigator {
    presentation?: {
      defaultRequest: PresentationRequest | null;
    };
  }
  interface Window {
    PresentationRequest?: new (url: string | string[]) => PresentationRequest;
  }
}

export function useCast(roomCode: string) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [connection, setConnection] = useState<PresentationConnection | null>(null);

  useEffect(() => {
    // Check if Presentation API is available
    if (typeof window !== 'undefined' && 'PresentationRequest' in window) {
      const boardUrl = `${window.location.origin}/board?autoJoin=${encodeURIComponent(roomCode)}`;
      
      const request = new window.PresentationRequest!([boardUrl]);
      
      // Check availability
      request.getAvailability()
        .then(availability => {
          setIsAvailable(availability.value);
        })
        .catch(err => {
          console.error('Error checking cast availability:', err);
        });
    }
  }, [roomCode]);

  const startCasting = useCallback(async () => {
    if (typeof window === 'undefined' || !window.PresentationRequest) {
      console.warn('Presentation API not available');
      return;
    }

    try {
      const boardUrl = `${window.location.origin}/board?autoJoin=${encodeURIComponent(roomCode)}`;
      const request = new window.PresentationRequest([boardUrl]);
      
      const presentationConnection = await request.start();
      setConnection(presentationConnection);
      setIsCasting(true);

      // Listen for connection state changes
      presentationConnection.addEventListener('connect', () => {
        console.log('Presentation connected');
        setIsCasting(true);
      });

      presentationConnection.addEventListener('close', () => {
        console.log('Presentation closed');
        setIsCasting(false);
        setConnection(null);
      });

      presentationConnection.addEventListener('terminate', () => {
        console.log('Presentation terminated');
        setIsCasting(false);
        setConnection(null);
      });

    } catch (err) {
      console.error('Error starting presentation:', err);
      setIsCasting(false);
    }
  }, [roomCode]);

  const stopCasting = useCallback(() => {
    if (connection) {
      connection.close();
      setConnection(null);
      setIsCasting(false);
    }
  }, [connection]);

  return {
    isAvailable,
    isCasting,
    startCasting,
    stopCasting,
  };
}
