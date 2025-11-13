import { GameRoom, RoomStatus } from '../../models/types';

// Mock Redis
const mockGet = jest.fn();
const mockSetex = jest.fn();

jest.mock('../../config/redis', () => ({
  getRedisClient: jest.fn(() => ({
    setex: mockSetex,
    get: mockGet,
  })),
}));

// Mock customSpaceService
jest.mock('../customSpaceService', () => ({
  getActiveSpaces: jest.fn().mockResolvedValue([]),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-session-id'),
}));

import {
  createRoom,
  addPlayerToRoom,
  markPlayerDisconnected,
  reconnectPlayer,
} from '../gameService';

describe('Player Reconnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetex.mockResolvedValue('OK');
  });

  describe('markPlayerDisconnected', () => {
    it('should mark a player as disconnected without removing them', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'socket1',
        players: [
          {
            id: 'socket1',
            playerSessionId: 'session1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'socket2',
            playerSessionId: 'session2',
            roomId: 'room1',
            name: 'Bob',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.PLAYING,
        currentTurn: 0,
        board: { tiles: [], seed: 'test' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(roomData));

      const updatedRoom = await markPlayerDisconnected('room1', 'socket2');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(2);
      
      const disconnectedPlayer = updatedRoom?.players.find(p => p.id === 'socket2');
      expect(disconnectedPlayer?.isConnected).toBe(false);
      expect(disconnectedPlayer?.lastDisconnectedAt).toBeDefined();
      
      // Player should still be in the room
      expect(updatedRoom?.players.find(p => p.playerSessionId === 'session2')).toBeDefined();
    });

    it('should not affect other players when one disconnects', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'socket1',
        players: [
          {
            id: 'socket1',
            playerSessionId: 'session1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'socket2',
            playerSessionId: 'session2',
            roomId: 'room1',
            name: 'Bob',
            position: 5,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.PLAYING,
        currentTurn: 1,
        board: { tiles: [], seed: 'test' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(roomData));

      const updatedRoom = await markPlayerDisconnected('room1', 'socket2');

      expect(updatedRoom).not.toBeNull();
      
      const connectedPlayer = updatedRoom?.players.find(p => p.id === 'socket1');
      expect(connectedPlayer?.isConnected).toBe(true);
      expect(connectedPlayer?.position).toBe(0);
      expect(connectedPlayer?.isHost).toBe(true);
    });
  });

  describe('reconnectPlayer', () => {
    it('should reconnect a player with their previous session', async () => {
      const sessionData = {
        roomId: 'room1',
        playerId: 'old-socket-id',
      };

      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'socket1',
        players: [
          {
            id: 'socket1',
            playerSessionId: 'session1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'old-socket-id',
            playerSessionId: 'session2',
            roomId: 'room1',
            name: 'Bob',
            position: 5,
            isHost: false,
            isConnected: false,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
            lastDisconnectedAt: new Date('2024-01-01T10:05:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.PLAYING,
        currentTurn: 0,
        board: { tiles: [], seed: 'test' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockImplementation((key: string) => {
        if (key === 'session:session2') {
          return Promise.resolve(JSON.stringify(sessionData));
        }
        if (key === 'room:room1') {
          return Promise.resolve(JSON.stringify(roomData));
        }
        return Promise.resolve(null);
      });

      const result = await reconnectPlayer('session2', 'new-socket-id');

      expect(result).not.toBeNull();
      expect(result?.player.id).toBe('new-socket-id');
      expect(result?.player.playerSessionId).toBe('session2');
      expect(result?.player.isConnected).toBe(true);
      expect(result?.player.lastDisconnectedAt).toBeUndefined();
      expect(result?.player.name).toBe('Bob');
      expect(result?.player.position).toBe(5); // Position should be preserved
    });

    it('should return null for invalid session', async () => {
      mockGet.mockResolvedValue(null);

      const result = await reconnectPlayer('invalid-session', 'new-socket-id');

      expect(result).toBeNull();
    });

    it('should return null when room no longer exists', async () => {
      const sessionData = {
        roomId: 'nonexistent-room',
        playerId: 'old-socket-id',
      };

      mockGet.mockImplementation((key: string) => {
        if (key === 'session:session2') {
          return Promise.resolve(JSON.stringify(sessionData));
        }
        return Promise.resolve(null);
      });

      const result = await reconnectPlayer('session2', 'new-socket-id');

      expect(result).toBeNull();
    });

    it('should preserve player state during reconnection', async () => {
      const sessionData = {
        roomId: 'room1',
        playerId: 'old-socket-id',
      };

      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'socket1',
        players: [
          {
            id: 'socket1',
            playerSessionId: 'session1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'old-socket-id',
            playerSessionId: 'session2',
            roomId: 'room1',
            name: 'Bob',
            avatar: '🎮',
            position: 10,
            isHost: false,
            isConnected: false,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
            lastDisconnectedAt: new Date('2024-01-01T10:05:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.PLAYING,
        currentTurn: 1,
        board: { tiles: [], seed: 'test' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockImplementation((key: string) => {
        if (key === 'session:session2') {
          return Promise.resolve(JSON.stringify(sessionData));
        }
        if (key === 'room:room1') {
          return Promise.resolve(JSON.stringify(roomData));
        }
        return Promise.resolve(null);
      });

      const result = await reconnectPlayer('session2', 'new-socket-id');

      expect(result).not.toBeNull();
      expect(result?.player.name).toBe('Bob');
      expect(result?.player.avatar).toBe('🎮');
      expect(result?.player.position).toBe(10);
      expect(result?.player.isHost).toBe(false);
      expect(result?.room.currentTurn).toBe(1);
    });
  });

  describe('createRoom with session tracking', () => {
    it('should create room with playerSessionId', async () => {
      const room = await createRoom('socket1', 'Alice', '🎮');

      expect(room.players).toHaveLength(1);
      expect(room.players[0].playerSessionId).toBe('mock-session-id');
      expect(room.players[0].id).toBe('socket1');
      expect(room.players[0].name).toBe('Alice');
      expect(room.players[0].isConnected).toBe(true);
      
      // Verify session was stored in Redis
      expect(mockSetex).toHaveBeenCalledWith(
        'session:mock-session-id',
        expect.any(Number),
        expect.stringContaining('socket1')
      );
    });
  });

  describe('addPlayerToRoom with session tracking', () => {
    it('should add player with playerSessionId', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'socket1',
        players: [
          {
            id: 'socket1',
            playerSessionId: 'session1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.WAITING,
        currentTurn: 0,
        board: { tiles: [], seed: 'test' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(roomData));

      const updatedRoom = await addPlayerToRoom('room1', 'socket2', 'Bob', '🎯');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(2);
      
      const newPlayer = updatedRoom?.players.find(p => p.id === 'socket2');
      expect(newPlayer?.playerSessionId).toBe('mock-session-id');
      expect(newPlayer?.name).toBe('Bob');
      expect(newPlayer?.isConnected).toBe(true);
      
      // Verify session was stored in Redis
      expect(mockSetex).toHaveBeenCalledWith(
        'session:mock-session-id',
        expect.any(Number),
        expect.stringContaining('socket2')
      );
    });
  });
});
