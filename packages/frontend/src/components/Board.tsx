'use client';

import { BoardState, Player, TileType } from '@/types/game';

/**
 * Board component - displays the game board with visual tiles and player positions
 * Updates in real-time as players move
 */
interface BoardProps {
  board: BoardState;
  players: Player[];
}

/**
 * Generate spiral order for board tiles
 * Returns an array where index represents the spiral order and value is the tile position
 * Starts from outer edge and spirals inward to center
 */
function generateSpiralOrder(numTiles: number): number[] {
  // Determine grid dimensions - use rectangular grid
  const cols = 10; // Fixed columns for consistency with current grid
  const rows = Math.ceil(numTiles / cols);
  
  const grid: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(-1));
  const spiralOrder: number[] = [];
  
  let top = 0, bottom = rows - 1;
  let left = 0, right = cols - 1;
  let position = 0;
  
  // Build spiral from outside to inside
  while (top <= bottom && left <= right && position < numTiles) {
    // Move right along top row
    for (let col = left; col <= right && position < numTiles; col++) {
      grid[top][col] = position++;
      spiralOrder.push(grid[top][col]);
    }
    top++;
    
    // Move down along right column
    for (let row = top; row <= bottom && position < numTiles; row++) {
      grid[row][right] = position++;
      spiralOrder.push(grid[row][right]);
    }
    right--;
    
    // Move left along bottom row
    if (top <= bottom) {
      for (let col = right; col >= left && position < numTiles; col--) {
        grid[bottom][col] = position++;
        spiralOrder.push(grid[bottom][col]);
      }
      bottom--;
    }
    
    // Move up along left column
    if (left <= right) {
      for (let row = bottom; row >= top && position < numTiles; row--) {
        grid[row][left] = position++;
        spiralOrder.push(grid[row][left]);
      }
      left++;
    }
  }
  
  return spiralOrder;
}

export default function Board({ board, players }: BoardProps) {
  // Generate spiral order for tiles
  const spiralOrder = generateSpiralOrder(board.tiles.length);
  
  // Create a reordered tiles array for spiral display
  const reorderedTiles = spiralOrder.map(position => 
    board.tiles.find(tile => tile.position === position)
  ).filter(tile => tile !== undefined);
  
  // Get tile color based on type
  const getTileColor = (type: TileType): string => {
    switch (type) {
      case TileType.START:
        return 'bg-gradient-to-br from-accent-green to-green-400 border-green-600';
      case TileType.FINISH:
        return 'bg-gradient-to-br from-accent-yellow to-yellow-400 border-yellow-600';
      case TileType.CHALLENGE:
        return 'bg-gradient-to-br from-accent-orange to-orange-400 border-orange-600';
      case TileType.BONUS:
        return 'bg-gradient-to-br from-accent-blue to-blue-400 border-blue-600';
      case TileType.PENALTY:
        return 'bg-gradient-to-br from-red-500 to-red-400 border-red-600';
      default:
        return 'bg-gradient-to-br from-gray-200 to-gray-100 border-gray-300';
    }
  };

  // Get tile emoji based on type
  const getTileEmoji = (type: TileType): string => {
    switch (type) {
      case TileType.START:
        return '🏁';
      case TileType.FINISH:
        return '🏆';
      case TileType.CHALLENGE:
        return '❓';
      case TileType.BONUS:
        return '⭐';
      case TileType.PENALTY:
        return '💀';
      default:
        return '';
    }
  };

  // Get players at a specific position
  const getPlayersAtPosition = (position: number): Player[] => {
    return players.filter(p => p.position === position && !p.name.includes('Board Display'));
  };

  // Player avatar colors (cycling through colors)
  const playerColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
        {reorderedTiles.map((tile) => {
          if (!tile) return null;
          const playersOnTile = getPlayersAtPosition(tile.position);
          
          return (
            <div
              key={tile.id}
              className={`relative aspect-square rounded-lg border-4 ${getTileColor(tile.type)} 
                shadow-md flex flex-col items-center justify-center p-1 transition-all duration-300 hover:scale-105`}
            >
              {/* Tile number */}
              <div className="absolute top-0 left-0 bg-white/80 rounded-br-lg px-1.5 py-0.5">
                <span className="text-xs font-bold text-gray-700">{tile.position}</span>
              </div>

              {/* Tile emoji */}
              <div className="text-xl md:text-2xl">
                {getTileEmoji(tile.type)}
              </div>

              {/* Players on this tile */}
              {playersOnTile.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center flex-wrap gap-0.5 p-1">
                  {playersOnTile.map((player, playerIndex) => {
                    const colorIndex = players.findIndex(p => p.id === player.id) % playerColors.length;
                    return (
                      <div
                        key={player.id}
                        className={`${player.avatar ? 'bg-white' : playerColors[colorIndex]} 
                          ${player.avatar ? 'w-6 h-6 md:w-7 md:h-7' : 'w-4 h-4 md:w-5 md:h-5'} 
                          rounded-full border-2 border-white shadow-lg flex items-center justify-center 
                          ${player.avatar ? 'text-xl md:text-2xl' : 'text-white text-[8px] md:text-xs'} 
                          font-bold animate-bounce`}
                        title={player.name}
                      >
                        {player.avatar || player.name.charAt(0).toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-light-purple rounded-2xl p-4 backdrop-blur-sm">
        <h3 className="text-lg md:text-xl font-bold text-primary mb-3 text-center">Board Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded ${getTileColor(TileType.START)} border-4 flex items-center justify-center text-lg`}>
              {getTileEmoji(TileType.START)}
            </div>
            <span className="text-sm font-bold text-gray-700">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded ${getTileColor(TileType.NORMAL)} border-4 flex items-center justify-center text-lg`}>
              {getTileEmoji(TileType.NORMAL)}
            </div>
            <span className="text-sm font-bold text-gray-700">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded ${getTileColor(TileType.CHALLENGE)} border-4 flex items-center justify-center text-lg`}>
              {getTileEmoji(TileType.CHALLENGE)}
            </div>
            <span className="text-sm font-bold text-gray-700">Challenge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded ${getTileColor(TileType.BONUS)} border-4 flex items-center justify-center text-lg`}>
              {getTileEmoji(TileType.BONUS)}
            </div>
            <span className="text-sm font-bold text-gray-700">Bonus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded ${getTileColor(TileType.PENALTY)} border-4 flex items-center justify-center text-lg`}>
              {getTileEmoji(TileType.PENALTY)}
            </div>
            <span className="text-sm font-bold text-gray-700">Penalty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded ${getTileColor(TileType.FINISH)} border-4 flex items-center justify-center text-lg`}>
              {getTileEmoji(TileType.FINISH)}
            </div>
            <span className="text-sm font-bold text-gray-700">Finish</span>
          </div>
        </div>

        {/* Player Legend */}
        <div className="mt-4 pt-4 border-t-2 border-gray-300">
          <h4 className="text-md font-bold text-primary mb-2 text-center">Players</h4>
          <div className="grid grid-cols-2 gap-2">
            {players.filter(p => !p.name.includes('Board Display')).map((player, index) => {
              const colorIndex = index % playerColors.length;
              return (
                <div key={player.id} className="flex items-center gap-2">
                  <div className={`${player.avatar ? 'bg-white' : playerColors[colorIndex]} 
                    ${player.avatar ? 'w-8 h-8' : 'w-6 h-6'} rounded-full border-2 
                    ${player.avatar ? 'border-gray-300' : 'border-white'} shadow-md 
                    flex items-center justify-center 
                    ${player.avatar ? 'text-2xl' : 'text-white text-xs'} font-bold
                    ${!player.isConnected ? 'opacity-50 grayscale' : ''}`}>
                    {player.avatar || player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm font-bold truncate ${!player.isConnected ? 'text-gray-400' : 'text-gray-700'}`}>
                    {player.isHost && '👑 '}
                    {player.name}
                    {!player.isConnected && ' 🔌'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
