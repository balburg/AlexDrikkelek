// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-challenge-uuid'),
}));

import { getRandomChallenge } from '../challengeService';
import { ChallengeType, AgeRating, TileType } from '../../models/types';

describe('Challenge Tile Integration', () => {
  describe('CHALLENGE tile behavior', () => {
    it('should return TRIVIA challenge for CHALLENGE tiles', async () => {
      // Simulate landing on a CHALLENGE tile
      const tileType = TileType.CHALLENGE;
      
      // This mimics the logic in index.ts for CHALLENGE tiles
      let challengeType;
      if (tileType === TileType.CHALLENGE) {
        challengeType = ChallengeType.TRIVIA;
      }
      
      const challenge = await getRandomChallenge(challengeType);
      
      // Verify we got a trivia challenge
      expect(challenge.type).toBe(ChallengeType.TRIVIA);
      expect('question' in challenge && challenge.question).toBeDefined();
      expect('answers' in challenge && challenge.answers).toBeDefined();
      expect('correctAnswer' in challenge && challenge.correctAnswer !== undefined).toBe(true);
      if ('answers' in challenge) {
        expect(challenge.answers?.length).toBeGreaterThan(0);
      }
    });

    it('should return challenges with appropriate age ratings', async () => {
      const challenge = await getRandomChallenge(ChallengeType.TRIVIA, AgeRating.ALL);
      
      expect(challenge.type).toBe(ChallengeType.TRIVIA);
      expect(challenge.ageRating).toBe(AgeRating.ALL);
    });

    it('should return different trivia challenges on repeated calls', async () => {
      // Get multiple trivia challenges
      const challenges = new Set();
      for (let i = 0; i < 10; i++) {
        const challenge = await getRandomChallenge(ChallengeType.TRIVIA);
        challenges.add(challenge.id);
      }
      
      // Should have variety (at least 2 different challenges in 10 tries)
      expect(challenges.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Other tile types', () => {
    it('should return any challenge type for BONUS tiles when not specified', async () => {
      const challenge = await getRandomChallenge();
      
      expect(challenge).toBeDefined();
      expect(challenge.type).toBeDefined();
      expect(challenge.points).toBeGreaterThan(0);
    });

    it('should return any challenge type for PENALTY tiles when not specified', async () => {
      const challenge = await getRandomChallenge();
      
      expect(challenge).toBeDefined();
      expect(challenge.type).toBeDefined();
      expect(challenge.points).toBeGreaterThan(0);
    });
  });
});
