import { 
  getRandomChallenge, 
  getChallengeById, 
  validateTriviaAnswer 
} from '../challengeService';
import { ChallengeType, AgeRating } from '../../models/types';

describe('challengeService', () => {
  describe('getRandomChallenge', () => {
    it('should return a challenge', () => {
      const challenge = getRandomChallenge();
      expect(challenge).toBeDefined();
      expect(challenge.id).toBeDefined();
      expect(challenge.type).toBeDefined();
      expect(challenge.points).toBeGreaterThan(0);
    });

    it('should return challenges matching age rating', () => {
      const challenge = getRandomChallenge(undefined, AgeRating.ALL);
      expect(challenge.ageRating).toBe(AgeRating.ALL);
    });

    it('should return challenges of specified type', () => {
      const challenge = getRandomChallenge(ChallengeType.TRIVIA);
      expect(challenge.type).toBe(ChallengeType.TRIVIA);
      expect(challenge.question).toBeDefined();
      expect(challenge.answers).toBeDefined();
      expect(challenge.correctAnswer).toBeDefined();
    });

    it('should return action challenges with action property', () => {
      const challenge = getRandomChallenge(ChallengeType.ACTION);
      expect(challenge.type).toBe(ChallengeType.ACTION);
      expect(challenge.action).toBeDefined();
    });
  });

  describe('getChallengeById', () => {
    it('should return challenge with matching id', () => {
      const challenge = getChallengeById('trivia_1');
      expect(challenge).toBeDefined();
      expect(challenge?.id).toBe('trivia_1');
    });

    it('should return undefined for non-existent id', () => {
      const challenge = getChallengeById('non_existent');
      expect(challenge).toBeUndefined();
    });
  });

  describe('validateTriviaAnswer', () => {
    it('should validate correct answer', () => {
      const isCorrect = validateTriviaAnswer('trivia_1', 1);
      expect(isCorrect).toBe(true);
    });

    it('should invalidate incorrect answer', () => {
      const isCorrect = validateTriviaAnswer('trivia_1', 0);
      expect(isCorrect).toBe(false);
    });

    it('should return false for non-existent challenge', () => {
      const isCorrect = validateTriviaAnswer('non_existent', 0);
      expect(isCorrect).toBe(false);
    });
  });
});
