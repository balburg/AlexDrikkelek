import { GameRoom, Player, BoardState, Tile, TileType, RoomStatus } from '../models/types';
import { getRedisClient } from '../config/redis';

const redis = getRedisClient();

/**
 * Generate a unique room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a procedural board based on a seed
 */
export function generateBoard(seed: string, numTiles: number = 50): BoardState {
  const tiles: Tile[] = [];
  
  // Create tiles based on seed for reproducibility
  for (let i = 0; i < numTiles; i++) {
    let type: TileType = TileType.NORMAL;
    
    if (i === 0) {
      type = TileType.START;
    } else if (i === numTiles - 1) {
      type = TileType.FINISH;
    } else {
      // Use seed to determine tile types pseudo-randomly
      const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0) * (i + 1), 0);
      const random = (hash % 100) / 100;
      
      if (random < 0.3) {
        type = TileType.CHALLENGE;
      } else if (random < 0.4) {
        type = TileType.BONUS;
      } else if (random < 0.5) {
        type = TileType.PENALTY;
      } else {
        type = TileType.NORMAL;
      }
    }
    
    tiles.push({
      id: i,
      position: i,
      type,
      challengeId: (type === TileType.CHALLENGE || type === TileType.BONUS || type === TileType.PENALTY) 
        ? `challenge_${i}` 
        : undefined,
    });
  }
  
  return {
    tiles,
    seed,
  };
}

/**
 * Create a new game room
 */
export async function createRoom(hostId: string, hostName: string, hostAvatar?: string, maxPlayers: number = 10): Promise<GameRoom> {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const code = generateRoomCode();
  const seed = `${Date.now()}_${Math.random()}`;
  
  const host: Player = {
    id: hostId,
    roomId,
    name: hostName,
    avatar: hostAvatar,
    position: 0,
    isHost: true,
    isConnected: true,
    joinedAt: new Date(),
  };
  
  const room: GameRoom = {
    id: roomId,
    code,
    hostId,
    players: [host],
    maxPlayers,
    status: RoomStatus.WAITING,
    currentTurn: 0,
    board: generateBoard(seed),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Store in Redis
  await redis.setex(`room:${roomId}`, 3600 * 4, JSON.stringify(room)); // 4 hour expiry
  await redis.setex(`room:code:${code}`, 3600 * 4, roomId);
  
  return room;
}

/**
 * Get a room by ID
 */
export async function getRoom(roomId: string): Promise<GameRoom | null> {
  const data = await redis.get(`room:${roomId}`);
  if (!data) return null;
  
  const room = JSON.parse(data);
  // Convert date strings back to Date objects
  room.createdAt = new Date(room.createdAt);
  room.updatedAt = new Date(room.updatedAt);
  room.players = room.players.map((p: Player) => ({
    ...p,
    joinedAt: new Date(p.joinedAt),
  }));
  
  return room;
}

/**
 * Get a room by code
 */
export async function getRoomByCode(code: string): Promise<GameRoom | null> {
  const roomId = await redis.get(`room:code:${code}`);
  if (!roomId) return null;
  return getRoom(roomId);
}

/**
 * Update room in storage
 */
export async function updateRoom(room: GameRoom): Promise<void> {
  room.updatedAt = new Date();
  await redis.setex(`room:${room.id}`, 3600 * 4, JSON.stringify(room));
}

/**
 * Add a player to a room
 */
export async function addPlayerToRoom(roomId: string, playerId: string, playerName: string, playerAvatar?: string): Promise<GameRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  
  if (room.status !== RoomStatus.WAITING) {
    throw new Error('Game has already started');
  }
  
  if (room.players.length >= room.maxPlayers) {
    throw new Error('Room is full');
  }
  
  // Check if player already in room
  const existingPlayer = room.players.find(p => p.id === playerId);
  if (existingPlayer) {
    existingPlayer.isConnected = true;
    await updateRoom(room);
    return room;
  }
  
  const player: Player = {
    id: playerId,
    roomId,
    name: playerName,
    avatar: playerAvatar,
    position: 0,
    isHost: false,
    isConnected: true,
    joinedAt: new Date(),
  };
  
  room.players.push(player);
  await updateRoom(room);
  
  return room;
}

/**
 * Start the game
 */
export async function startGame(roomId: string): Promise<GameRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  
  if (room.status !== RoomStatus.WAITING) {
    throw new Error('Game already started or finished');
  }
  
  if (room.players.length < 2) {
    throw new Error('Need at least 2 players to start');
  }
  
  room.status = RoomStatus.PLAYING;
  room.currentTurn = 0;
  await updateRoom(room);
  
  return room;
}

/**
 * Move player and check for special tiles
 */
export async function movePlayer(
  roomId: string, 
  playerId: string, 
  diceRoll: number
): Promise<{ room: GameRoom; tile: Tile | null }> {
  const room = await getRoom(roomId);
  if (!room) throw new Error('Room not found');
  
  const player = room.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');
  
  // Update player position
  const newPosition = Math.min(player.position + diceRoll, room.board.tiles.length - 1);
  player.position = newPosition;
  
  // Get the tile the player landed on
  const landedTile = room.board.tiles[newPosition];
  
  await updateRoom(room);
  
  return { room, tile: landedTile };
}

/**
 * Advance to next turn
 */
export async function nextTurn(roomId: string): Promise<GameRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  
  room.currentTurn = (room.currentTurn + 1) % room.players.length;
  await updateRoom(room);
  
  return room;
}

/**
 * Remove player from room and handle host promotion if needed
 */
export async function removePlayer(roomId: string, playerId: string): Promise<GameRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return room;
  
  const wasHost = room.players[playerIndex].isHost;
  
  // Remove the player
  room.players.splice(playerIndex, 1);
  
  // If no players left, we could delete the room, but for now just update
  if (room.players.length === 0) {
    await updateRoom(room);
    return room;
  }
  
  // If the removed player was the host, promote the oldest remaining player
  if (wasHost) {
    await promoteNewHost(room);
  }
  
  // Adjust current turn if necessary
  if (room.status === RoomStatus.PLAYING && room.players.length > 0) {
    room.currentTurn = room.currentTurn % room.players.length;
  }
  
  await updateRoom(room);
  return room;
}

/**
 * Promote the oldest player to host
 */
export async function promoteNewHost(room: GameRoom): Promise<void> {
  if (room.players.length === 0) return;
  
  // Sort players by join time and promote the oldest
  const oldestPlayer = room.players.reduce((oldest, player) => 
    player.joinedAt < oldest.joinedAt ? player : oldest
  );
  
  // Update all players' host status
  room.players.forEach(p => {
    p.isHost = p.id === oldestPlayer.id;
  });
  
  // Update room host ID
  room.hostId = oldestPlayer.id;
}
