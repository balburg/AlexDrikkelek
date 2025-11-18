import { ChallengeVoteSession } from '../models/types';
import { getInMemoryStore } from '../config/inMemoryStore';

const store = getInMemoryStore();

/**
 * Create a new voting session for a challenge
 */
export async function createVotingSession(
  roomId: string,
  challengingPlayerId: string,
  challengingPlayerName: string,
  challengeId: string,
  totalVoters: number
): Promise<ChallengeVoteSession> {
  const session: ChallengeVoteSession = {
    roomId,
    challengingPlayerId,
    challengingPlayerName,
    challengeId,
    votes: [],
    totalVoters,
  };

  // Store voting session with a short expiry (5 minutes)
  await store.setex(`vote:${roomId}`, 300, JSON.stringify(session));
  
  return session;
}

/**
 * Get an active voting session for a room
 */
export async function getVotingSession(roomId: string): Promise<ChallengeVoteSession | null> {
  const data = await store.get(`vote:${roomId}`);
  if (!data) return null;
  
  return JSON.parse(data);
}

/**
 * Record a vote in the voting session
 */
export async function castVote(
  roomId: string,
  playerId: string,
  vote: boolean
): Promise<ChallengeVoteSession | null> {
  const session = await getVotingSession(roomId);
  if (!session) return null;

  // Check if player already voted
  const existingVoteIndex = session.votes.findIndex(v => v.playerId === playerId);
  if (existingVoteIndex >= 0) {
    // Update existing vote
    session.votes[existingVoteIndex].vote = vote;
  } else {
    // Add new vote
    session.votes.push({ playerId, vote });
  }

  // Update the session
  await store.setex(`vote:${roomId}`, 300, JSON.stringify(session));
  
  return session;
}

/**
 * Check if voting is complete and calculate result
 */
export function isVotingComplete(session: ChallengeVoteSession): boolean {
  return session.votes.length >= session.totalVoters;
}

/**
 * Calculate the voting result
 * Returns true if majority voted "Yes", false otherwise
 */
export function calculateVoteResult(session: ChallengeVoteSession): boolean {
  if (session.votes.length === 0) return false;

  const yesVotes = session.votes.filter(v => v.vote).length;
  const noVotes = session.votes.filter(v => !v.vote).length;

  return yesVotes > noVotes;
}

/**
 * Delete a voting session
 */
export async function deleteVotingSession(roomId: string): Promise<void> {
  await store.del(`vote:${roomId}`);
}
