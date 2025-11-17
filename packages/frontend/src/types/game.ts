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
  playerSessionId: string;
  roomId: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  position: number;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: Date;
  lastDisconnectedAt?: Date;
}

// Board Types
export interface BoardState {
  tiles: Tile[];
  seed: string;
}

export interface Tile {
  id: number;
  position: number;
  type: TileType;
  challengeId?: string;
  customSpaceId?: string; // Reference to a custom space if applicable
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
  RECONNECT = 'reconnect_player',
  PLAYER_RECONNECTED = 'player_reconnected',
  
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
  PLAYER_FINISHED = 'player_finished',
  FINISH_GAME = 'finish_game',
}

// Admin Settings Types
export interface GameSettings {
  maxPlayersPerRoom: number;
  defaultBoardSize: number;
  enableChallenges: boolean;
  challengeDifficulty: ChallengeDifficulty;
  turnTimeoutSeconds: number;
  allowLateJoin: boolean;
  minPlayersToStart: number;
  updatedAt: Date;
}

export enum ChallengeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED',
}

// Style Pack Types
export interface StylePack {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  theme: StyleTheme;
  previewImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StyleTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accentBlue: string;
  accentOrange: string;
  accentGreen: string;
  accentYellow: string;
  background?: string;
  pattern?: string;
}

// Custom Space Types
export enum CustomSpaceType {
  CHALLENGE = 'CHALLENGE',
  DRINKING = 'DRINKING',
  QUIZ = 'QUIZ',
  TRIVIA = 'TRIVIA',
  ACTION = 'ACTION',
  DARE = 'DARE',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
  SPECIAL = 'SPECIAL',
}

export interface CustomSpace {
  id: string;
  name: string;
  description: string;
  type: CustomSpaceType;
  logoUrl?: string;
  backgroundUrl?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  packId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomSpacePack {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  spaces: CustomSpace[];
  createdAt: Date;
  updatedAt: Date;
}
