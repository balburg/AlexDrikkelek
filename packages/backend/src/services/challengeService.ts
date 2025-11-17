import { Challenge, ChallengeType, AgeRating } from '../models/types';
import * as challengeRepository from '../repositories/challengeRepository';
import { v4 as uuidv4 } from 'uuid';

// Built-in challenge data as fallback when database is unavailable
const BUILT_IN_CHALLENGES: Challenge[] = [
  // Trivia challenges
  {
    id: 'trivia_1',
    type: ChallengeType.TRIVIA,
    category: 'General Knowledge',
    ageRating: AgeRating.ALL,
    question: 'What is the capital of France?',
    answers: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'trivia_2',
    type: ChallengeType.TRIVIA,
    category: 'Science',
    ageRating: AgeRating.ALL,
    question: 'What planet is known as the Red Planet?',
    answers: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correctAnswer: 2,
    points: 10,
  },
  {
    id: 'trivia_3',
    type: ChallengeType.TRIVIA,
    category: 'Sports',
    ageRating: AgeRating.ALL,
    question: 'How many players are on a soccer team on the field?',
    answers: ['9', '10', '11', '12'],
    correctAnswer: 2,
    points: 10,
  },
  // Action challenges
  {
    id: 'action_1',
    type: ChallengeType.ACTION,
    category: 'Physical',
    ageRating: AgeRating.ALL,
    action: 'Do 5 jumping jacks!',
    points: 5,
  },
  {
    id: 'action_2',
    type: ChallengeType.ACTION,
    category: 'Physical',
    ageRating: AgeRating.ALL,
    action: 'Balance on one foot for 10 seconds!',
    points: 5,
  },
  {
    id: 'action_3',
    type: ChallengeType.ACTION,
    category: 'Creative',
    ageRating: AgeRating.ALL,
    action: 'Sing the first line of your favorite song!',
    points: 5,
  },
  {
    id: 'action_4',
    type: ChallengeType.ACTION,
    category: 'Physical',
    ageRating: AgeRating.ALL,
    action: 'Do a silly dance for 10 seconds!',
    points: 5,
  },
  {
    id: 'action_5',
    type: ChallengeType.ACTION,
    category: 'Physical',
    ageRating: AgeRating.ALL,
    action: 'Clap your hands 20 times as fast as you can!',
    points: 5,
  },
  {
    id: 'action_6',
    type: ChallengeType.ACTION,
    category: 'Creative',
    ageRating: AgeRating.ALL,
    action: 'Make everyone laugh with a funny face!',
    points: 5,
  },
  {
    id: 'action_7',
    type: ChallengeType.ACTION,
    category: 'Physical',
    ageRating: AgeRating.ALL,
    action: 'Spin around 3 times and walk in a straight line!',
    points: 5,
  },
  // Dare challenges
  {
    id: 'dare_1',
    type: ChallengeType.DARE,
    category: 'Social',
    ageRating: AgeRating.TEEN,
    action: 'Tell everyone your most embarrassing moment!',
    points: 15,
  },
  {
    id: 'dare_2',
    type: ChallengeType.DARE,
    category: 'Social',
    ageRating: AgeRating.TEEN,
    action: 'Imitate the player on your left for the next turn!',
    points: 15,
  },
  // Drinking challenges (for adult games)
  {
    id: 'drink_1',
    type: ChallengeType.DRINKING,
    category: 'Party',
    ageRating: AgeRating.ADULT,
    action: 'Take a sip of your drink!',
    points: 5,
  },
  {
    id: 'drink_2',
    type: ChallengeType.DRINKING,
    category: 'Party',
    ageRating: AgeRating.ADULT,
    action: 'Everyone drinks! Cheers!',
    points: 10,
  },
  {
    id: 'drink_3',
    type: ChallengeType.DRINKING,
    category: 'Party',
    ageRating: AgeRating.ALL,
    action: 'Drink some soda or water!',
    points: 5,
  },
  {
    id: 'drink_4',
    type: ChallengeType.DRINKING,
    category: 'Party',
    ageRating: AgeRating.ALL,
    action: 'Take 3 sips of your favorite drink!',
    points: 5,
  },
  {
    id: 'drink_5',
    type: ChallengeType.DRINKING,
    category: 'Party',
    ageRating: AgeRating.ADULT,
    action: 'Pick someone to drink with you!',
    points: 5,
  },
];

/**
 * Get a random challenge by type and age rating
 */
export async function getRandomChallenge(
  type?: ChallengeType,
  ageRating: AgeRating = AgeRating.ALL
): Promise<Challenge> {
  try {
    // Try to get challenges from database
    const challenges = await challengeRepository.getChallengesByTypeAndAge(type, ageRating);
    
    if (challenges.length > 0) {
      const randomIndex = Math.floor(Math.random() * challenges.length);
      return challenges[randomIndex];
    }
    
    // If no challenges match in database, try without type filter
    if (type) {
      const allChallenges = await challengeRepository.getChallengesByTypeAndAge(undefined, ageRating);
      if (allChallenges.length > 0) {
        const randomIndex = Math.floor(Math.random() * allChallenges.length);
        return allChallenges[randomIndex];
      }
    }
    
    // If still no challenges, fall back to built-in challenges
    throw new Error('No challenges found in database');
  } catch (error) {
    // Fallback to built-in challenges
    console.warn('Database unavailable, using built-in challenges as fallback:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    let filtered = BUILT_IN_CHALLENGES.filter(c => {
      const ageMatch = c.ageRating === AgeRating.ALL || c.ageRating === ageRating;
      const typeMatch = !type || c.type === type;
      return ageMatch && typeMatch;
    });
    
    if (filtered.length === 0) {
      filtered = BUILT_IN_CHALLENGES.filter(c => c.ageRating === AgeRating.ALL);
    }
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }
}

/**
 * Get a challenge by ID
 */
export async function getChallengeById(id: string): Promise<Challenge | undefined> {
  try {
    const challenge = await challengeRepository.getChallengeById(id);
    return challenge || undefined;
  } catch (error) {
    // Fallback to built-in challenges
    console.warn('Database unavailable, using built-in challenges as fallback:', 
      error instanceof Error ? error.message : 'Unknown error');
    return BUILT_IN_CHALLENGES.find(c => c.id === id);
  }
}

/**
 * Validate a trivia answer
 */
export async function validateTriviaAnswer(challengeId: string, answerIndex: number): Promise<boolean> {
  const challenge = await getChallengeById(challengeId);
  if (!challenge || challenge.type !== ChallengeType.TRIVIA) {
    return false;
  }
  
  return 'correctAnswer' in challenge && challenge.correctAnswer === answerIndex;
}

/**
 * Get all challenges
 */
export async function getAllChallenges(): Promise<Challenge[]> {
  try {
    return await challengeRepository.getAllChallenges();
  } catch (error) {
    console.warn('Database unavailable, using built-in challenges as fallback:', 
      error instanceof Error ? error.message : 'Unknown error');
    return BUILT_IN_CHALLENGES;
  }
}

/**
 * Create a new challenge
 */
export async function createChallenge(data: Omit<Challenge, 'id'>): Promise<Challenge> {
  try {
    const id = uuidv4();
    return await challengeRepository.createChallenge(id, data);
  } catch (error) {
    console.error('Error creating challenge in database:', error);
    throw error;
  }
}

/**
 * Update a challenge
 */
export async function updateChallenge(id: string, updates: Partial<Omit<Challenge, 'id'>>): Promise<Challenge | null> {
  try {
    return await challengeRepository.updateChallenge(id, updates);
  } catch (error) {
    console.error('Error updating challenge in database:', error);
    throw error;
  }
}

/**
 * Delete a challenge
 */
export async function deleteChallenge(id: string): Promise<boolean> {
  try {
    await challengeRepository.deleteChallenge(id);
    return true;
  } catch (error) {
    console.error('Error deleting challenge from database:', error);
    return false;
  }
}
