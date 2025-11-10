# API Documentation

## Backend API Endpoints

### Health Check

**Endpoint:** `GET /health`

**Description:** Check if the server is running and healthy.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Ping

**Endpoint:** `GET /api/ping`

**Description:** Simple ping endpoint for testing connectivity.

**Response:**
```json
{
  "message": "pong"
}
```

### Create Room (Planned)

**Endpoint:** `POST /api/rooms`

**Description:** Create a new game room.

**Request Body:**
```json
{
  "playerName": "string",
  "maxPlayers": "number (2-10)"
}
```

**Response:**
```json
{
  "roomId": "uuid",
  "roomCode": "string (6 chars)",
  "hostId": "uuid"
}
```

### Join Room (Planned)

**Endpoint:** `POST /api/rooms/:code/join`

**Description:** Join an existing game room.

**Request Body:**
```json
{
  "playerName": "string"
}
```

**Response:**
```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "players": ["array of player objects"]
}
```

## Socket.IO Events

### Client → Server

#### `create_room`
Create a new game room.

**Payload:**
```typescript
{
  playerName: string;
  maxPlayers: number;
}
```

#### `join_room`
Join an existing room.

**Payload:**
```typescript
{
  roomCode: string;
  playerName: string;
}
```

#### `leave_room`
Leave the current room.

**Payload:**
```typescript
{
  roomId: string;
  playerId: string;
}
```

#### `roll_dice`
Roll the dice (when it's your turn).

**Payload:**
```typescript
{
  roomId: string;
  playerId: string;
}
```

#### `challenge_completed`
Complete a challenge.

**Payload:**
```typescript
{
  roomId: string;
  playerId: string;
  success: boolean;
}
```

### Server → Client

#### `room_updated`
Broadcast when room state changes.

**Payload:**
```typescript
{
  room: GameRoom;
}
```

#### `dice_rolled`
Broadcast when dice is rolled.

**Payload:**
```typescript
{
  playerId: string;
  value: number;
}
```

#### `player_moved`
Broadcast when player moves.

**Payload:**
```typescript
{
  playerId: string;
  fromPosition: number;
  toPosition: number;
}
```

#### `challenge_started`
Broadcast when a challenge starts.

**Payload:**
```typescript
{
  playerId: string;
  challenge: Challenge;
}
```

#### `turn_changed`
Broadcast when turn changes.

**Payload:**
```typescript
{
  currentPlayerId: string;
}
```

#### `game_started`
Broadcast when game starts.

**Payload:**
```typescript
{
  roomId: string;
  players: Player[];
}
```

#### `game_ended`
Broadcast when game ends.

**Payload:**
```typescript
{
  winnerId: string;
  duration: number;
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes

- `ROOM_NOT_FOUND` - Room with given code doesn't exist
- `ROOM_FULL` - Room has reached maximum player capacity
- `INVALID_TURN` - It's not the player's turn
- `INVALID_ACTION` - Action is not allowed in current state
- `PLAYER_NOT_IN_ROOM` - Player is not part of the room
- `UNAUTHORIZED` - User is not authenticated or authorized
