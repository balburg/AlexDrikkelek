// Mock in-memory store - create a single mock instance
const mockGet = jest.fn();
const mockSetex = jest.fn();

jest.mock('../../config/inMemoryStore', () => ({
  getInMemoryStore: jest.fn(() => ({
    setex: mockSetex,
    get: mockGet,
    keys: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock customSpaceService
jest.mock('../customSpaceService', () => ({
  getActiveSpaces: jest.fn().mockResolvedValue([]),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

import { nextTurn, generateBoardSync } from '../gameService';
import { GameRoom, RoomStatus } from '../../models/types';

describe('Challenge Completion Turn Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue('OK');
  });

  it('should advance turn to next player when answer is incorrect', async () => {
    // Create a mock room with 3 players
    const roomData: GameRoom = {
      id: 'room1',
      code: 'ABC123',
      hostId: 'player1',
      players: [
        {
          id: 'player1',
          playerSessionId: 'session1',
          roomId: 'room1',
          name: 'Host Player',
          position: 0,
          isHost: true,
          isConnected: true,
          joinedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'player2',
          playerSessionId: 'session2',
          roomId: 'room1',
          name: 'Player 2',
          position: 0,
          isHost: false,
          isConnected: true,
          joinedAt: new Date('2024-01-01T10:01:00Z'),
        },
        {
          id: 'player3',
          playerSessionId: 'session3',
          roomId: 'room1',
          name: 'Player 3',
          position: 0,
          isHost: false,
          isConnected: true,
          joinedAt: new Date('2024-01-01T10:02:00Z'),
        },
      ],
      maxPlayers: 10,
      status: RoomStatus.PLAYING,
      currentTurn: 0,
      board: generateBoardSync('seed', 50),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Mock getRoom to return our room data
    mockGet.mockResolvedValue(JSON.stringify(roomData));
    
    // Verify initial state
    expect(roomData.currentTurn).toBe(0);
    
    // Simulate incorrect answer - turn should advance to next player
    const updatedRoom = await nextTurn('room1');
    
    expect(updatedRoom).not.toBeNull();
    expect(updatedRoom?.currentTurn).toBe(1);
  });

  it('should cycle back to first player after last player answers incorrectly', async () => {
    // Create a mock room with 3 players, starting at last player
    const roomData: GameRoom = {
      id: 'room1',
      code: 'ABC123',
      hostId: 'player1',
      players: [
        {
          id: 'player1',
          playerSessionId: 'session1',
          roomId: 'room1',
          name: 'Host Player',
          position: 0,
          isHost: true,
          isConnected: true,
          joinedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'player2',
          playerSessionId: 'session2',
          roomId: 'room1',
          name: 'Player 2',
          position: 0,
          isHost: false,
          isConnected: true,
          joinedAt: new Date('2024-01-01T10:01:00Z'),
        },
        {
          id: 'player3',
          playerSessionId: 'session3',
          roomId: 'room1',
          name: 'Player 3',
          position: 0,
          isHost: false,
          isConnected: true,
          joinedAt: new Date('2024-01-01T10:02:00Z'),
        },
      ],
      maxPlayers: 10,
      status: RoomStatus.PLAYING,
      currentTurn: 2, // Last player
      board: generateBoardSync('seed', 50),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockGet.mockResolvedValue(JSON.stringify(roomData));
    
    // Advance turn (simulating incorrect answer)
    const updatedRoom = await nextTurn('room1');
    
    // Should cycle back to player 0
    expect(updatedRoom).not.toBeNull();
    expect(updatedRoom?.currentTurn).toBe(0);
  });
});
