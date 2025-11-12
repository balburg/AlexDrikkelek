import { Challenge, ChallengeType, AgeRating } from '../models/types';

// Sample challenge data - in production, this would come from the database
const challenges: Challenge[] = [
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
];

/**
 * Get a random challenge by type and age rating
 */
export function getRandomChallenge(
  type?: ChallengeType,
  ageRating: AgeRating = AgeRating.ALL
): Challenge {
  // Filter challenges by type and age rating
  let filtered = challenges.filter(c => {
    // Check age rating - ALL can be played by everyone
    const ageMatch = c.ageRating === AgeRating.ALL || c.ageRating === ageRating;
    
    // Check type if specified
    const typeMatch = !type || c.type === type;
    
    return ageMatch && typeMatch;
  });
  
  // If no challenges match, fall back to ALL age rating
  if (filtered.length === 0) {
    filtered = challenges.filter(c => c.ageRating === AgeRating.ALL);
  }
  
  // Return a random challenge from the filtered list
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

/**
 * Get a challenge by ID
 */
export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find(c => c.id === id);
}

/**
 * Validate a trivia answer
 */
export function validateTriviaAnswer(challengeId: string, answerIndex: number): boolean {
  const challenge = getChallengeById(challengeId);
  if (!challenge || challenge.type !== ChallengeType.TRIVIA) {
    return false;
  }
  
  return challenge.correctAnswer === answerIndex;
}
