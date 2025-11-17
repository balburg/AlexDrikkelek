import * as gameService from './gameService';

export interface GameStatistics {
  totalGames: number;
  activeGames: number;
  completedGames: number;
  totalPlayers: number;
  averagePlayersPerGame: number;
  gamesInWaiting: number;
  recentGames: Array<{
    id: string;
    code: string;
    status: string;
    playerCount: number;
    createdAt: Date;
  }>;
}

/**
 * Get overall game statistics
 */
export async function getGameStatistics(): Promise<GameStatistics> {
  const allRooms = await gameService.getAllRooms();
  
  const activeGames = allRooms.filter(r => r.status === 'PLAYING').length;
  const completedGames = allRooms.filter(r => r.status === 'FINISHED').length;
  const gamesInWaiting = allRooms.filter(r => r.status === 'WAITING').length;
  
  const totalPlayers = allRooms.reduce((sum, room) => sum + room.players.length, 0);
  const averagePlayersPerGame = allRooms.length > 0 
    ? Math.round((totalPlayers / allRooms.length) * 10) / 10 
    : 0;
  
  // Get recent games (last 10)
  const recentGames = allRooms
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(room => ({
      id: room.id,
      code: room.code,
      status: room.status,
      playerCount: room.players.length,
      createdAt: room.createdAt,
    }));
  
  return {
    totalGames: allRooms.length,
    activeGames,
    completedGames,
    gamesInWaiting,
    totalPlayers,
    averagePlayersPerGame,
    recentGames,
  };
}
