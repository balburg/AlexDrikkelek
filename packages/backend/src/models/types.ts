// Game Room Types
export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  status: RoomStatus;
  currentTurn: number;
  board: BoardState;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoomStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

// Player Types
export interface Player {
  id: string;
  roomId: string;
  name: string;
  avatarUrl?: string;
  position: number;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: Date;
}

// Board Types
export interface BoardState {
  tiles: Tile[];
  seed: string; // For procedural generation
}

export interface Tile {
  id: number;
  position: number;
  type: TileType;
  challengeId?: string;
}

export enum TileType {
  START = 'START',
  NORMAL = 'NORMAL',
  CHALLENGE = 'CHALLENGE',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
  FINISH = 'FINISH',
}

// Challenge Types
export interface Challenge {
  id: string;
  type: ChallengeType;
  category: string;
  ageRating: AgeRating;
  question?: string;
  answers?: string[];
  correctAnswer?: number;
  action?: string;
  points: number;
}

export enum ChallengeType {
  TRIVIA = 'TRIVIA',
  ACTION = 'ACTION',
  DARE = 'DARE',
  DRINKING = 'DRINKING',
}

export enum AgeRating {
  ALL = 'ALL',
  TEEN = 'TEEN',
  ADULT = 'ADULT',
}

// Socket Events
export enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Room Management
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  ROOM_UPDATED = 'room_updated',
  PLAYER_DISCONNECTED = 'player_disconnected',
  HOST_CHANGED = 'host_changed',
  
  // Game Actions
  ROLL_DICE = 'roll_dice',
  DICE_ROLLED = 'dice_rolled',
  MOVE_PLAYER = 'move_player',
  PLAYER_MOVED = 'player_moved',
  CHALLENGE_STARTED = 'challenge_started',
  CHALLENGE_COMPLETED = 'challenge_completed',
  
  // Turn Management
  NEXT_TURN = 'next_turn',
  TURN_CHANGED = 'turn_changed',
  
  // Game State
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
}
