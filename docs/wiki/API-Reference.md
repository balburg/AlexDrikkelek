# API Reference

Complete reference for AlexDrikkelek's REST API endpoints and WebSocket events.

## Table of Contents

1. [REST API Endpoints](#rest-api-endpoints)
2. [WebSocket Events](#websocket-events)
3. [Data Types](#data-types)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

## REST API Endpoints

### Base URL

**Development:** `http://localhost:3001`  
**Production:** `https://your-backend-url.azurewebsites.net`

### Health Check

Check if the server is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-12T10:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Server is healthy
- `503 Service Unavailable`: Server is experiencing issues

---

### Ping

Simple connectivity test endpoint.

**Endpoint:** `GET /api/ping`

**Response:**
```json
{
  "message": "pong"
}
```

**Status Codes:**
- `200 OK`: Server is reachable

---

### Create Room (Planned)

Create a new game room.

**Endpoint:** `POST /api/rooms`

**Request Body:**
```json
{
  "playerName": "string (required, 1-50 characters)",
  "maxPlayers": "number (optional, 2-10, default: 10)"
}
```

**Example:**
```json
{
  "playerName": "Alex",
  "maxPlayers": 6
}
```

**Response:**
```json
{
  "roomId": "uuid",
  "roomCode": "ABC123",
  "hostId": "uuid",
  "created": "2024-11-12T10:00:00.000Z"
}
```

**Status Codes:**
- `201 Created`: Room successfully created
- `400 Bad Request`: Invalid input
- `429 Too Many Requests`: Rate limit exceeded

---

### Get Room Details (Planned)

Retrieve information about a specific game room.

**Endpoint:** `GET /api/rooms/:code`

**Parameters:**
- `code` (path): 6-character room code (e.g., "ABC123")

**Response:**
```json
{
  "id": "uuid",
  "code": "ABC123",
  "hostId": "uuid",
  "status": "waiting | active | finished",
  "maxPlayers": 10,
  "currentPlayers": 3,
  "players": [
    {
      "id": "uuid",
      "name": "Alex",
      "position": 0,
      "turnOrder": 0,
      "isHost": true
    }
  ],
  "created": "2024-11-12T10:00:00.000Z",
  "started": null
}
```

**Status Codes:**
- `200 OK`: Room found
- `404 Not Found`: Room with given code doesn't exist

---

### Join Room (Planned)

Join an existing game room.

**Endpoint:** `POST /api/rooms/:code/join`

**Parameters:**
- `code` (path): 6-character room code

**Request Body:**
```json
{
  "playerName": "string (required, 1-50 characters)"
}
```

**Response:**
```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "turnOrder": 2,
  "players": [...]
}
```

**Status Codes:**
- `200 OK`: Successfully joined
- `400 Bad Request`: Invalid input or room is full
- `404 Not Found`: Room doesn't exist
- `409 Conflict`: Game already started

---

### Get Random Challenge (Planned)

Retrieve a random challenge based on criteria.

**Endpoint:** `GET /api/challenges/random`

**Query Parameters:**
- `type` (optional): `trivia | action | dare | drinking`
- `ageRating` (optional): `kids | teens | adults`
- `difficulty` (optional): `1 | 2 | 3 | 4 | 5`

**Example:**
```
GET /api/challenges/random?type=trivia&ageRating=adults&difficulty=3
```

**Response:**
```json
{
  "id": "uuid",
  "type": "trivia",
  "category": "General Knowledge",
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correctAnswer": "Paris",
  "ageRating": "kids",
  "difficulty": 2
}
```

**Status Codes:**
- `200 OK`: Challenge retrieved
- `404 Not Found`: No challenges match the criteria

---

### Get All Style Packs

Retrieve all available style packs/themes.

**Endpoint:** `GET /api/admin/style-packs`

**Authentication:** Admin only

**Response:**
```json
[
  {
    "id": "default",
    "name": "Default",
    "description": "Original AlexDrikkelek theme",
    "isActive": true,
    "isDefault": true,
    "theme": {
      "primary": "#8B5CF6",
      "primaryLight": "#A78BFA",
      "primaryDark": "#7C3AED",
      "secondary": "#EC4899",
      "secondaryLight": "#F472B6",
      "secondaryDark": "#DB2777",
      "accentBlue": "#3B82F6",
      "accentOrange": "#F97316",
      "accentGreen": "#10B981",
      "accentYellow": "#EAB308"
    },
    "createdAt": "2024-11-01T00:00:00.000Z",
    "updatedAt": "2024-11-01T00:00:00.000Z"
  }
]
```

**Status Codes:**
- `200 OK`: Style packs retrieved successfully
- `401 Unauthorized`: Not authenticated as admin

---

### Get Active Style Pack

Retrieve the currently active style pack.

**Endpoint:** `GET /api/admin/style-packs/active`

**Authentication:** Admin only

**Response:**
```json
{
  "id": "christmas",
  "name": "Christmas",
  "description": "Festive red and green holiday theme",
  "isActive": true,
  "isDefault": true,
  "theme": {
    "primary": "#C41E3A",
    "primaryLight": "#DC143C",
    "primaryDark": "#A00020",
    "secondary": "#0F8B3C",
    "secondaryLight": "#10A54A",
    "secondaryDark": "#0C6B2F",
    "accentBlue": "#2C5F8D",
    "accentOrange": "#D4AF37",
    "accentGreen": "#228B22",
    "accentYellow": "#FFD700"
  },
  "createdAt": "2024-11-01T00:00:00.000Z",
  "updatedAt": "2024-11-12T10:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Active style pack retrieved
- `404 Not Found`: No active style pack found
- `401 Unauthorized`: Not authenticated as admin

---

### Get Current Theme (Public)

Public endpoint to retrieve the currently active theme colors.

**Endpoint:** `GET /api/theme`

**Authentication:** None (public endpoint)

**Response:**
```json
{
  "name": "Christmas",
  "theme": {
    "primary": "#C41E3A",
    "primaryLight": "#DC143C",
    "primaryDark": "#A00020",
    "secondary": "#0F8B3C",
    "secondaryLight": "#10A54A",
    "secondaryDark": "#0C6B2F",
    "accentBlue": "#2C5F8D",
    "accentOrange": "#D4AF37",
    "accentGreen": "#228B22",
    "accentYellow": "#FFD700"
  }
}
```

**Status Codes:**
- `200 OK`: Theme retrieved successfully

---

### Create Style Pack

Create a new custom style pack.

**Endpoint:** `POST /api/admin/style-packs`

**Authentication:** Admin only

**Request Body:**
```json
{
  "name": "Summer Vibes",
  "description": "Bright and sunny theme for summer",
  "theme": {
    "primary": "#FF6B35",
    "primaryLight": "#FF8C61",
    "primaryDark": "#E65A2E",
    "secondary": "#F7B801",
    "secondaryLight": "#FFCA28",
    "secondaryDark": "#D89E01",
    "accentBlue": "#1E90FF",
    "accentOrange": "#FF7F50",
    "accentGreen": "#32CD32",
    "accentYellow": "#FFD700"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Summer Vibes",
  "description": "Bright and sunny theme for summer",
  "isActive": false,
  "isDefault": false,
  "theme": { ... },
  "createdAt": "2024-11-12T10:00:00.000Z",
  "updatedAt": "2024-11-12T10:00:00.000Z"
}
```

**Status Codes:**
- `201 Created`: Style pack created successfully
- `400 Bad Request`: Invalid input (missing fields or invalid color codes)
- `401 Unauthorized`: Not authenticated as admin

**Validation:**
- Name: Required, 1-100 characters
- Description: Required, 1-500 characters
- Theme colors: All 10 colors required in hex format (#RRGGBB)

---

### Activate Style Pack

Activate a specific style pack.

**Endpoint:** `POST /api/admin/style-packs/:id/activate`

**Authentication:** Admin only

**Parameters:**
- `id` (path): Style pack ID (e.g., "christmas", "uuid")

**Response:**
```json
{
  "id": "christmas",
  "name": "Christmas",
  "description": "Festive red and green holiday theme",
  "isActive": true,
  "isDefault": true,
  "theme": { ... },
  "createdAt": "2024-11-01T00:00:00.000Z",
  "updatedAt": "2024-11-12T10:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Style pack activated successfully
- `404 Not Found`: Style pack with given ID doesn't exist
- `401 Unauthorized`: Not authenticated as admin

**Behavior:**
- Deactivates previously active style pack
- Activates the specified style pack
- Theme changes apply immediately across the application

---

### Delete Style Pack

Delete a custom style pack.

**Endpoint:** `DELETE /api/admin/style-packs/:id`

**Authentication:** Admin only

**Parameters:**
- `id` (path): Style pack ID (must be a custom theme)

**Response:**
```json
{
  "message": "Style pack deleted successfully"
}
```

**Status Codes:**
- `200 OK`: Style pack deleted successfully
- `400 Bad Request`: Cannot delete built-in theme or active theme
- `404 Not Found`: Style pack with given ID doesn't exist
- `401 Unauthorized`: Not authenticated as admin

**Protection:**
- Cannot delete built-in themes (Default, Christmas, Halloween)
- Cannot delete currently active theme (activate another first)
- Only custom themes can be deleted

---

## WebSocket Events

WebSocket connection established via Socket.IO at the same base URL.

**Connection URL:** `ws://localhost:3001/socket.io/` (development)

### Connection Events

#### `connect`

Emitted when client successfully connects to the server.

**Client Receives:**
```typescript
socket.on('connect', () => {
  console.log('Connected with socket ID:', socket.id);
});
```

#### `disconnect`

Emitted when client disconnects from the server.

**Client Receives:**
```typescript
socket.on('disconnect', (reason: string) => {
  console.log('Disconnected:', reason);
});
```

---

### Room Management Events

#### `create_room` (Client → Server)

Create a new game room.

**Client Emits:**
```typescript
socket.emit('create_room', {
  playerName: string;
  maxPlayers?: number; // Optional, default: 10
});
```

**Server Responds:** `room_updated` event

---

#### `join_room` (Client → Server)

Join an existing game room.

**Client Emits:**
```typescript
socket.emit('join_room', {
  code: string;        // 6-character room code
  playerName: string;  // Player display name
});
```

**Server Responds:** `room_updated` event

---

#### `leave_room` (Client → Server)

Leave the current game room.

**Client Emits:**
```typescript
socket.emit('leave_room', {
  roomId: string;
  playerId: string;
});
```

**Server Responds:** `room_updated` event to remaining players

---

#### `room_updated` (Server → Client)

Broadcast when room state changes (player joins, leaves, etc.).

**Client Receives:**
```typescript
socket.on('room_updated', (data: GameRoom) => {
  // Update UI with new room state
});
```

**Data Structure:**
```typescript
{
  id: string;
  code: string;
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
  maxPlayers: number;
  currentTurn: number;
  players: Player[];
  board: Tile[];
}
```

---

### Game Flow Events

#### `start_game` (Client → Server)

Start the game (host only).

**Client Emits:**
```typescript
socket.emit('start_game', {
  roomId: string;
});
```

**Server Responds:** `game_started` event

---

#### `game_started` (Server → Client)

Broadcast when the game begins.

**Client Receives:**
```typescript
socket.on('game_started', (data: GameRoom) => {
  // Initialize game board and UI
});
```

---

#### `roll_dice` (Client → Server)

Roll the dice (current player only).

**Client Emits:**
```typescript
socket.emit('roll_dice', {
  roomId: string;
  playerId: string;
});
```

**Server Responds:** `dice_rolled` event

**Validation:**
- Must be the current player's turn
- Game must be in `active` status
- Player must not have already rolled this turn

---

#### `dice_rolled` (Server → Client)

Broadcast the result of a dice roll.

**Client Receives:**
```typescript
socket.on('dice_rolled', (data: {
  playerId: string;
  playerName: string;
  diceRoll: number; // 1-6
}) => {
  // Display dice roll animation
});
```

---

#### `move_player` (Client → Server)

Move player to new position (automatic after dice roll).

**Client Emits:**
```typescript
socket.emit('move_player', {
  roomId: string;
  playerId: string;
  diceRoll: number;
});
```

**Server Responds:** `player_moved` event

**Server Logic:**
- Calculates new position
- Checks tile type at new position
- Triggers challenge if applicable

---

#### `player_moved` (Server → Client)

Broadcast when a player moves.

**Client Receives:**
```typescript
socket.on('player_moved', (data: {
  playerId: string;
  playerName: string;
  newPosition: number;
  tile: Tile;
}) => {
  // Update player position on board
});
```

---

### Challenge Events

#### `challenge_started` (Server → Client)

Broadcast when a player lands on a challenge tile.

**Client Receives:**
```typescript
socket.on('challenge_started', (data: {
  playerId: string;
  playerName: string;
  tile: Tile;
  challenge: Challenge;
}) => {
  // Display challenge modal
});
```

**Challenge Structure:**
```typescript
{
  id: string;
  type: 'trivia' | 'action' | 'dare' | 'drinking';
  category: string;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer?: string;
  ageRating: 'kids' | 'teens' | 'adults';
  difficulty: number; // 1-5
}
```

---

#### `challenge_completed` (Client → Server)

Submit challenge completion.

**Client Emits:**
```typescript
socket.emit('challenge_completed', {
  roomId: string;
  playerId: string;
  success: boolean;  // true if correct/completed
  answer?: string;   // For trivia challenges
});
```

**Server Responds:** `challenge_completed` (broadcast) + `turn_changed` events

---

#### `challenge_completed` (Server → Client)

Broadcast challenge result.

**Client Receives:**
```typescript
socket.on('challenge_completed', (data: {
  playerId: string;
  playerName: string;
  success: boolean;
}) => {
  // Display success/failure message
});
```

---

### Turn Management Events

#### `turn_changed` (Server → Client)

Broadcast when turn advances to next player.

**Client Receives:**
```typescript
socket.on('turn_changed', (data: {
  currentTurn: number;
  currentPlayer: Player;
}) => {
  // Update UI to show whose turn it is
});
```

---

#### `game_ended` (Server → Client)

Broadcast when a player reaches the finish.

**Client Receives:**
```typescript
socket.on('game_ended', (data: {
  winnerId: string;
  winnerName: string;
  stats: {
    totalTurns: number;
    duration: number; // milliseconds
    challengesCompleted: number;
  };
}) => {
  // Display victory screen
});
```

---

### Error Events

#### `error` (Server → Client)

Broadcast when an error occurs.

**Client Receives:**
```typescript
socket.on('error', (data: {
  code: string;
  message: string;
}) => {
  // Display error message to user
});
```

**Common Error Codes:**
- `ROOM_NOT_FOUND`: Room with given code doesn't exist
- `ROOM_FULL`: Room has reached maximum player capacity
- `INVALID_TURN`: It's not the player's turn
- `INVALID_ACTION`: Action is not allowed in current state
- `PLAYER_NOT_IN_ROOM`: Player is not part of the room
- `GAME_ALREADY_STARTED`: Cannot join a game in progress
- `UNAUTHORIZED`: User is not authenticated or authorized

---

## Data Types

### GameRoom

```typescript
interface GameRoom {
  id: string;
  code: string;                    // 6-character PIN
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
  maxPlayers: number;
  currentTurn: number;             // Index of current player
  players: Player[];
  board: Tile[];
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}
```

### Player

```typescript
interface Player {
  id: string;
  name: string;
  position: number;                // Current position on board
  turnOrder: number;               // Order in which they joined
  isHost: boolean;
  avatar?: string;                 // Avatar color or image
  score?: number;                  // Optional scoring
}
```

### Tile

```typescript
interface Tile {
  position: number;
  type: 'start' | 'normal' | 'challenge' | 'bonus' | 'penalty' | 'finish';
  color?: string;
  icon?: string;
}
```

### Challenge

```typescript
interface Challenge {
  id: string;
  type: 'trivia' | 'action' | 'dare' | 'drinking';
  category: string;
  question: string;
  options?: string[];              // For multiple choice
  correctAnswer?: string;
  ageRating: 'kids' | 'teens' | 'adults';
  difficulty: number;              // 1-5
}
```

### Socket Events Enum

```typescript
enum SocketEvent {
  // Room Management
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  ROOM_UPDATED = 'room_updated',
  
  // Game Flow
  START_GAME = 'start_game',
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  
  // Actions
  ROLL_DICE = 'roll_dice',
  DICE_ROLLED = 'dice_rolled',
  MOVE_PLAYER = 'move_player',
  PLAYER_MOVED = 'player_moved',
  
  // Challenges
  CHALLENGE_STARTED = 'challenge_started',
  CHALLENGE_COMPLETED = 'challenge_completed',
  
  // Turns
  TURN_CHANGED = 'turn_changed',
}
```

---

## Error Handling

### HTTP Errors

All HTTP errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}  // Optional additional information
  }
}
```

**Example:**
```json
{
  "error": {
    "code": "ROOM_FULL",
    "message": "This room has reached maximum capacity (10 players)",
    "details": {
      "maxPlayers": 10,
      "currentPlayers": 10
    }
  }
}
```

### WebSocket Errors

WebSocket errors are emitted via the `error` event:

```typescript
socket.on('error', (data: {
  code: string;
  message: string;
}) => {
  // Handle error
});
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Successfully created room |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Room doesn't exist |
| 409 | Conflict | Game already started |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Server is down or overloaded |

---

## Rate Limiting

To prevent abuse, the API implements rate limiting:

**Limits:**
- REST API: 100 requests per minute per IP
- WebSocket events: 60 events per minute per socket
- Room creation: 10 rooms per hour per IP

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699876543
```

**Rate Limit Exceeded Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60  // seconds
    }
  }
}
```

---

---

## Anonymous Access

The API operates with anonymous access - no authentication required.

**How it works:**
1. Players provide a name and avatar when joining
2. Backend generates a session ID stored in in-memory storage
3. Session ID is saved in browser localStorage for reconnection
4. Sessions expire after a period of inactivity

**Benefits:**
- Lower barrier to entry
- Faster game start
- Privacy-friendly
- No need for account management

---

## WebSocket Connection Example

### JavaScript/TypeScript

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// Create room
socket.emit('create_room', {
  playerName: 'Alex',
  maxPlayers: 6,
});

// Listen for room updates
socket.on('room_updated', (room) => {
  console.log('Room updated:', room);
});

// Roll dice (when it's your turn)
socket.emit('roll_dice', {
  roomId: 'room-uuid',
  playerId: 'player-uuid',
});

// Listen for dice result
socket.on('dice_rolled', (data) => {
  console.log(`${data.playerName} rolled a ${data.diceRoll}!`);
});
```

---

## Related Documentation

- [User Guide](./User-Guide.md) - How to use the API in the game
- [Architecture](./Architecture.md) - System design and data flow
- [Build and Run](./Build-and-Run.md) - Local development setup

---

**Last updated:** 17-11-2025
