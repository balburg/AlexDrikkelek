// Mock in-memory store
const mockGet = jest.fn();
const mockSetex = jest.fn();
const mockDel = jest.fn();

jest.mock('../../config/inMemoryStore', () => ({
  getInMemoryStore: jest.fn(() => ({
    setex: mockSetex,
    get: mockGet,
    del: mockDel,
  })),
}));

import * as challengeVotingService from '../challengeVotingService';
import { ChallengeVoteSession } from '../../models/types';

describe('Challenge Voting Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue('OK');
    mockDel.mockResolvedValue(1);
  });

  describe('createVotingSession', () => {
    it('should create a new voting session', async () => {
      const session = await challengeVotingService.createVotingSession(
        'room1',
        'player1',
        'Alice',
        'challenge1',
        3
      );

      expect(session).toEqual({
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [],
        totalVoters: 3,
      });

      expect(mockSetex).toHaveBeenCalledWith(
        'vote:room1',
        300,
        expect.any(String)
      );
    });
  });

  describe('getVotingSession', () => {
    it('should return null if no session exists', async () => {
      mockGet.mockResolvedValue(null);

      const session = await challengeVotingService.getVotingSession('room1');

      expect(session).toBeNull();
      expect(mockGet).toHaveBeenCalledWith('vote:room1');
    });

    it('should return the voting session if it exists', async () => {
      const sessionData: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [],
        totalVoters: 3,
      };

      mockGet.mockResolvedValue(JSON.stringify(sessionData));

      const session = await challengeVotingService.getVotingSession('room1');

      expect(session).toEqual(sessionData);
    });
  });

  describe('castVote', () => {
    it('should add a new vote to the session', async () => {
      const sessionData: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [],
        totalVoters: 3,
      };

      mockGet.mockResolvedValue(JSON.stringify(sessionData));

      const updatedSession = await challengeVotingService.castVote('room1', 'player2', true);

      expect(updatedSession).not.toBeNull();
      expect(updatedSession?.votes).toHaveLength(1);
      expect(updatedSession?.votes[0]).toEqual({
        playerId: 'player2',
        vote: true,
      });

      expect(mockSetex).toHaveBeenCalledWith(
        'vote:room1',
        300,
        expect.any(String)
      );
    });

    it('should update an existing vote', async () => {
      const sessionData: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [{ playerId: 'player2', vote: true }],
        totalVoters: 3,
      };

      mockGet.mockResolvedValue(JSON.stringify(sessionData));

      const updatedSession = await challengeVotingService.castVote('room1', 'player2', false);

      expect(updatedSession).not.toBeNull();
      expect(updatedSession?.votes).toHaveLength(1);
      expect(updatedSession?.votes[0].vote).toBe(false);
    });

    it('should return null if session does not exist', async () => {
      mockGet.mockResolvedValue(null);

      const updatedSession = await challengeVotingService.castVote('room1', 'player2', true);

      expect(updatedSession).toBeNull();
    });
  });

  describe('isVotingComplete', () => {
    it('should return true when all votes are in', () => {
      const session: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [
          { playerId: 'player2', vote: true },
          { playerId: 'player3', vote: false },
          { playerId: 'player4', vote: true },
        ],
        totalVoters: 3,
      };

      expect(challengeVotingService.isVotingComplete(session)).toBe(true);
    });

    it('should return false when not all votes are in', () => {
      const session: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [
          { playerId: 'player2', vote: true },
        ],
        totalVoters: 3,
      };

      expect(challengeVotingService.isVotingComplete(session)).toBe(false);
    });
  });

  describe('calculateVoteResult', () => {
    it('should return true when majority votes yes', () => {
      const session: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [
          { playerId: 'player2', vote: true },
          { playerId: 'player3', vote: true },
          { playerId: 'player4', vote: false },
        ],
        totalVoters: 3,
      };

      expect(challengeVotingService.calculateVoteResult(session)).toBe(true);
    });

    it('should return false when majority votes no', () => {
      const session: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [
          { playerId: 'player2', vote: false },
          { playerId: 'player3', vote: false },
          { playerId: 'player4', vote: true },
        ],
        totalVoters: 3,
      };

      expect(challengeVotingService.calculateVoteResult(session)).toBe(false);
    });

    it('should return false when votes are tied', () => {
      const session: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [
          { playerId: 'player2', vote: true },
          { playerId: 'player3', vote: false },
        ],
        totalVoters: 2,
      };

      expect(challengeVotingService.calculateVoteResult(session)).toBe(false);
    });

    it('should return false when no votes', () => {
      const session: ChallengeVoteSession = {
        roomId: 'room1',
        challengingPlayerId: 'player1',
        challengingPlayerName: 'Alice',
        challengeId: 'challenge1',
        votes: [],
        totalVoters: 3,
      };

      expect(challengeVotingService.calculateVoteResult(session)).toBe(false);
    });
  });

  describe('deleteVotingSession', () => {
    it('should delete the voting session', async () => {
      await challengeVotingService.deleteVotingSession('room1');

      expect(mockDel).toHaveBeenCalledWith('vote:room1');
    });
  });
});
