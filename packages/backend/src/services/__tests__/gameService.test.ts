import { TileType, GameRoom, RoomStatus } from '../../models/types';

// Mock Redis - create a single mock instance
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

import { 
  generateRoomCode, 
  generateBoardSync, 
  removePlayer,
  promoteNewHost,
  startGame,
} from '../gameService';

describe('gameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('generateRoomCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
    });

    it('should only contain valid characters', () => {
      const code = generateRoomCode();
      const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
      expect(code).toMatch(validChars);
    });

    it('should generate different codes', () => {
      const code1 = generateRoomCode();
      const code2 = generateRoomCode();
      // While technically they could be the same, probability is very low
      expect(code1).not.toBe(code2);
    });
  });

  describe('generateBoard', () => {
    it('should generate a board with correct number of tiles', () => {
      const board = generateBoardSync('test_seed', 50);
      expect(board.tiles).toHaveLength(50);
    });

    it('should have START tile at position 0', () => {
      const board = generateBoardSync('test_seed', 50);
      expect(board.tiles[0].type).toBe(TileType.START);
      expect(board.tiles[0].position).toBe(0);
    });

    it('should have FINISH tile at last position', () => {
      const board = generateBoardSync('test_seed', 50);
      const lastTile = board.tiles[board.tiles.length - 1];
      expect(lastTile.type).toBe(TileType.FINISH);
      expect(lastTile.position).toBe(49);
    });

    it('should include special tiles (CHALLENGE, BONUS, PENALTY)', () => {
      const board = generateBoardSync('test_seed', 50);
      const specialTiles = board.tiles.filter(
        t => t.type === TileType.CHALLENGE || 
             t.type === TileType.BONUS || 
             t.type === TileType.PENALTY
      );
      expect(specialTiles.length).toBeGreaterThan(0);
    });

    it('should assign challengeId to special tiles', () => {
      const board = generateBoardSync('test_seed', 50);
      const specialTiles = board.tiles.filter(
        t => t.type === TileType.CHALLENGE || 
             t.type === TileType.BONUS || 
             t.type === TileType.PENALTY
      );
      specialTiles.forEach(tile => {
        expect(tile.challengeId).toBeDefined();
      });
    });

    it('should generate same board for same seed', () => {
      const board1 = generateBoardSync('same_seed', 30);
      const board2 = generateBoardSync('same_seed', 30);
      
      expect(board1.tiles).toEqual(board2.tiles);
    });

    it('should store seed in board state', () => {
      const seed = 'test_seed_123';
      const board = generateBoardSync(seed, 50);
      expect(board.seed).toBe(seed);
    });
  });

  describe('promoteNewHost', () => {
    it('should promote the oldest player to host', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'player2',
            roomId: 'room1',
            name: 'Bob',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
          },
          {
            id: 'player3',
            roomId: 'room1',
            name: 'Charlie',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:02:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.WAITING,
        currentTurn: 0,
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await promoteNewHost(mockRoom);

      // Player1 (oldest) should be the new host
      expect(mockRoom.players[0].isHost).toBe(true);
      expect(mockRoom.players[1].isHost).toBe(false);
      expect(mockRoom.players[2].isHost).toBe(false);
      expect(mockRoom.hostId).toBe('player1');
    });

    it('should handle room with single player', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.WAITING,
        currentTurn: 0,
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await promoteNewHost(mockRoom);

      expect(mockRoom.players[0].isHost).toBe(true);
      expect(mockRoom.hostId).toBe('player1');
    });

    it('should handle empty room', async () => {
      const mockRoom: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [],
        maxPlayers: 10,
        status: RoomStatus.WAITING,
        currentTurn: 0,
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await promoteNewHost(mockRoom);

      // Should not throw and leave the room unchanged
      expect(mockRoom.players).toHaveLength(0);
    });
  });

  describe('removePlayer', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue(null);
      mockSetex.mockResolvedValue('OK');
    });

    it('should remove player and promote new host when host leaves', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'player2',
            roomId: 'room1',
            name: 'Bob',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
          },
          {
            id: 'player3',
            roomId: 'room1',
            name: 'Charlie',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:02:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.WAITING,
        currentTurn: 0,
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock get to return the room data, then allow modifications
      mockGet.mockImplementation((key: unknown) => {
        if (key === 'room:room1') {
          return Promise.resolve(JSON.stringify(roomData));
        }
        return Promise.resolve(null);
      });

      const updatedRoom = await removePlayer('room1', 'player1');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(2);
      expect(updatedRoom?.players.find(p => p.id === 'player1')).toBeUndefined();
      
      // Bob should be promoted to host (oldest remaining player)
      const newHost = updatedRoom?.players.find(p => p.isHost);
      expect(newHost?.id).toBe('player2');
      expect(newHost?.name).toBe('Bob');
      expect(updatedRoom?.hostId).toBe('player2');
    });

    it('should remove non-host player without promoting anyone', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'player2',
            roomId: 'room1',
            name: 'Bob',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.WAITING,
        currentTurn: 0,
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockImplementation((key: unknown) => {
        if (key === 'room:room1') {
          return Promise.resolve(JSON.stringify(roomData));
        }
        return Promise.resolve(null);
      });

      const updatedRoom = await removePlayer('room1', 'player2');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].id).toBe('player1');
      expect(updatedRoom?.players[0].isHost).toBe(true);
      expect(updatedRoom?.hostId).toBe('player1');
    });

    it('should adjust current turn when playing', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'player2',
            roomId: 'room1',
            name: 'Bob',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
          },
          {
            id: 'player3',
            roomId: 'room1',
            name: 'Charlie',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:02:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.PLAYING,
        currentTurn: 2, // Charlie's turn
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockImplementation((key: unknown) => {
        if (key === 'room:room1') {
          return Promise.resolve(JSON.stringify(roomData));
        }
        return Promise.resolve(null);
      });

      const updatedRoom = await removePlayer('room1', 'player3');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(2);
      // currentTurn should be adjusted to be within valid range (0-1)
      expect(updatedRoom?.currentTurn).toBeLessThan(2);
      expect(updatedRoom?.currentTurn).toBe(0); // 2 % 2 = 0
    });

    it('should return room with no players if last player leaves', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
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
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockImplementation((key: unknown) => {
        if (key === 'room:room1') {
          return Promise.resolve(JSON.stringify(roomData));
        }
        return Promise.resolve(null);
      });

      const updatedRoom = await removePlayer('room1', 'player1');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(0);
    });

    it('should return room unchanged if player not found', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
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
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockImplementation((key: unknown) => {
        if (key === 'room:room1') {
          return Promise.resolve(JSON.stringify(roomData));
        }
        return Promise.resolve(null);
      });

      const updatedRoom = await removePlayer('room1', 'nonexistent');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].id).toBe('player1');
    });

    it('should return null if room not found', async () => {
      mockGet.mockResolvedValue(null);

      const updatedRoom = await removePlayer('nonexistent', 'player1');

      expect(updatedRoom).toBeNull();
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue(null);
      mockSetex.mockResolvedValue('OK');
    });

    it('should start game with 2 players', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'player2',
            roomId: 'room1',
            name: 'Bob',
            position: 0,
            isHost: false,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:01:00Z'),
          },
        ],
        maxPlayers: 10,
        status: RoomStatus.WAITING,
        currentTurn: 0,
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(roomData));

      const updatedRoom = await startGame('room1');

      expect(updatedRoom).not.toBeNull();
      expect(updatedRoom?.status).toBe(RoomStatus.PLAYING);
      expect(updatedRoom?.currentTurn).toBe(0);
      expect(mockSetex).toHaveBeenCalled();
    });

    it('should throw error when trying to start with only 1 player', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
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
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(roomData));

      await expect(startGame('room1')).rejects.toThrow('Need at least 2 players to start');
    });

    it('should throw error when game already started', async () => {
      const roomData: GameRoom = {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          {
            id: 'player1',
            roomId: 'room1',
            name: 'Alice',
            position: 0,
            isHost: true,
            isConnected: true,
            joinedAt: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: 'player2',
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
        board: generateBoardSync('seed', 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(roomData));

      await expect(startGame('room1')).rejects.toThrow('Game already started or finished');
    });

    it('should return null if room not found', async () => {
      mockGet.mockResolvedValue(null);

      const updatedRoom = await startGame('nonexistent');

      expect(updatedRoom).toBeNull();
    });
  });
});
