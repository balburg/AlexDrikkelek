'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '@/types/game';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  playerSessionId: string | null;
  setPlayerSessionId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  playerSessionId: null,
  setPlayerSessionId: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerSessionId, setPlayerSessionIdState] = useState<string | null>(null);
  const reconnectAttempted = useRef(false);

  // Load playerSessionId from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('playerSessionId');
    if (storedSessionId) {
      setPlayerSessionIdState(storedSessionId);
    }
  }, []);

  // Save playerSessionId to localStorage when it changes
  const setPlayerSessionId = (id: string | null) => {
    setPlayerSessionIdState(id);
    if (id) {
      localStorage.setItem('playerSessionId', id);
    } else {
      localStorage.removeItem('playerSessionId');
    }
  };

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Attempt to reconnect with stored session if available
      if (playerSessionId && !reconnectAttempted.current) {
        console.log('Attempting to reconnect with session:', playerSessionId);
        reconnectAttempted.current = true;
        socketInstance.emit(SocketEvent.RECONNECT, { playerSessionId });
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      reconnectAttempted.current = false;
    });

    socketInstance.on(SocketEvent.PLAYER_RECONNECTED, (data: any) => {
      console.log('Player reconnected successfully:', data);
      // Reset the reconnect attempt flag
      reconnectAttempted.current = false;
    });

    socketInstance.on('error', (error: any) => {
      console.error('Socket error:', error);
      // If reconnection fails, clear the session
      if (error.message?.includes('Session not found')) {
        setPlayerSessionId(null);
        reconnectAttempted.current = false;
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [playerSessionId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, playerSessionId, setPlayerSessionId }}>
      {children}
    </SocketContext.Provider>
  );
}
