// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-challenge-uuid'),
}));

import { 
  getRandomChallenge, 
  getChallengeById, 
  validateTriviaAnswer 
} from '../challengeService';
import { ChallengeType, AgeRating } from '../../models/types';

describe('challengeService', () => {
  describe('getRandomChallenge', () => {
    it('should return a challenge', async () => {
      const challenge = await getRandomChallenge();
      expect(challenge).toBeDefined();
      expect(challenge.id).toBeDefined();
      expect(challenge.type).toBeDefined();
      expect(challenge.points).toBeGreaterThan(0);
    });

    it('should return challenges matching age rating', async () => {
      const challenge = await getRandomChallenge(undefined, AgeRating.ALL);
      expect(challenge.ageRating).toBe(AgeRating.ALL);
    });

    it('should return challenges of specified type', async () => {
      const challenge = await getRandomChallenge(ChallengeType.TRIVIA);
      expect(challenge.type).toBe(ChallengeType.TRIVIA);
      expect('question' in challenge && challenge.question).toBeDefined();
      expect('answers' in challenge && challenge.answers).toBeDefined();
      expect('correctAnswer' in challenge && challenge.correctAnswer !== undefined).toBe(true);
    });

    it('should return action challenges with action property', async () => {
      const challenge = await getRandomChallenge(ChallengeType.ACTION);
      expect(challenge.type).toBe(ChallengeType.ACTION);
      expect('action' in challenge && challenge.action).toBeDefined();
    });
  });

  describe('getChallengeById', () => {
    it('should return challenge with matching id', async () => {
      const challenge = await getChallengeById('trivia_1');
      expect(challenge).toBeDefined();
      expect(challenge?.id).toBe('trivia_1');
    });

    it('should return undefined for non-existent id', async () => {
      const challenge = await getChallengeById('non_existent');
      expect(challenge).toBeUndefined();
    });
  });

  describe('validateTriviaAnswer', () => {
    it('should validate correct answer', async () => {
      const isCorrect = await validateTriviaAnswer('trivia_1', 1);
      expect(isCorrect).toBe(true);
    });

    it('should invalidate incorrect answer', async () => {
      const isCorrect = await validateTriviaAnswer('trivia_1', 0);
      expect(isCorrect).toBe(false);
    });

    it('should return false for non-existent challenge', async () => {
      const isCorrect = await validateTriviaAnswer('non_existent', 0);
      expect(isCorrect).toBe(false);
    });
  });
});
