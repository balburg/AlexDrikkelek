import { generateRoomCode, generateBoard } from '../gameService';
import { TileType } from '../../models/types';

// Mock Redis
jest.mock('../../config/redis', () => ({
  getRedisClient: jest.fn(() => ({
    setex: jest.fn(),
    get: jest.fn(),
  })),
}));

describe('gameService', () => {
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
      const board = generateBoard('test_seed', 50);
      expect(board.tiles).toHaveLength(50);
    });

    it('should have START tile at position 0', () => {
      const board = generateBoard('test_seed', 50);
      expect(board.tiles[0].type).toBe(TileType.START);
      expect(board.tiles[0].position).toBe(0);
    });

    it('should have FINISH tile at last position', () => {
      const board = generateBoard('test_seed', 50);
      const lastTile = board.tiles[board.tiles.length - 1];
      expect(lastTile.type).toBe(TileType.FINISH);
      expect(lastTile.position).toBe(49);
    });

    it('should include special tiles (CHALLENGE, BONUS, PENALTY)', () => {
      const board = generateBoard('test_seed', 50);
      const specialTiles = board.tiles.filter(
        t => t.type === TileType.CHALLENGE || 
             t.type === TileType.BONUS || 
             t.type === TileType.PENALTY
      );
      expect(specialTiles.length).toBeGreaterThan(0);
    });

    it('should assign challengeId to special tiles', () => {
      const board = generateBoard('test_seed', 50);
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
      const board1 = generateBoard('same_seed', 30);
      const board2 = generateBoard('same_seed', 30);
      
      expect(board1.tiles).toEqual(board2.tiles);
    });

    it('should store seed in board state', () => {
      const seed = 'test_seed_123';
      const board = generateBoard(seed, 50);
      expect(board.seed).toBe(seed);
    });
  });
});
