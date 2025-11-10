# Architecture Documentation

## System Overview

AlexDrikkelek is a real-time multiplayer board game platform built on a client-server architecture with WebSocket communication for real-time gameplay synchronization.

## High-Level Architecture

```
┌─────────────────────┐
│   Player Devices    │
│ (Smartphones/Tablets│
└──────────┬──────────┘
           │
           │ Socket.IO
           │
┌──────────▼──────────┐      ┌─────────────────┐
│   Next.js Frontend  │◄────►│  Azure Static   │
│        (PWA)        │      │   Web Apps      │
└──────────┬──────────┘      └─────────────────┘
           │
           │ HTTP/WebSocket
           │
┌──────────▼──────────┐      ┌─────────────────┐
│  Fastify Backend    │◄────►│   Azure App     │
│   + Socket.IO       │      │    Service      │
└──────────┬──────────┘      └─────────────────┘
           │
           ├──────────┬──────────┬──────────┐
           │          │          │          │
┌──────────▼─┐  ┌────▼────┐ ┌──▼──────┐ ┌─▼──────────┐
│ Azure SQL  │  │  Redis  │ │  Blob   │ │   AD B2C   │
│  Database  │  │  Cache  │ │ Storage │ │   (Auth)   │
└────────────┘  └─────────┘ └─────────┘ └────────────┘
```

## Component Details

### Frontend (Next.js PWA)

**Responsibilities:**
- User interface for players and board display
- Real-time game state rendering
- Player input handling (dice rolls, challenge responses)
- Socket.IO client for WebSocket communication
- PWA capabilities for offline support
- Chromecast integration for TV display

**Key Technologies:**
- Next.js 14 with App Router
- React 18
- Socket.IO Client
- Tailwind CSS
- TypeScript

**Pages:**
- `/` - Landing page
- `/player` - Player control interface
- `/board` - Board display for TV/large screens
- `/room/[id]` - Game room (future)

### Backend (Fastify + Socket.IO)

**Responsibilities:**
- REST API endpoints for room management
- WebSocket server for real-time communication
- Server-authoritative game logic
- Database operations (CRUD)
- Redis pub/sub for scaling
- Authentication and authorization
- Challenge management

**Key Technologies:**
- Node.js 18+
- Fastify (HTTP server)
- Socket.IO (WebSocket)
- TypeScript
- mssql (Azure SQL client)
- ioredis (Redis client)

**API Endpoints:**
```
GET  /health              - Health check
GET  /api/ping           - Ping endpoint
POST /api/rooms          - Create game room
GET  /api/rooms/:id      - Get room details
POST /api/rooms/:id/join - Join room
POST /api/challenges     - Get random challenge
```

**Socket Events:**
```
Connection:
- connect / disconnect

Room Management:
- create_room / join_room / leave_room
- room_updated

Game Actions:
- roll_dice / dice_rolled
- move_player / player_moved
- challenge_started / challenge_completed

Turn Management:
- next_turn / turn_changed
- game_started / game_ended
```

### Database (Azure SQL)

**Schema:**
- `Players` - Player profiles
- `GameRooms` - Active game rooms
- `RoomPlayers` - Players in rooms
- `Challenges` - Challenge content
- `GameHistory` - Completed games

See `/database/schema.sql` for full schema.

### Caching (Azure Redis)

**Use Cases:**
- Session storage (player sessions)
- Room state caching (active games)
- Pub/sub for horizontal scaling
- Rate limiting
- Leaderboards (future)

### Storage (Azure Blob)

**Use Cases:**
- Player avatars
- Game assets (board tiles, icons)
- Static content

### Authentication (Azure AD B2C)

**Features:**
- OAuth 2.0 / OpenID Connect
- Social login (Google, Facebook, etc.)
- Guest access
- JWT tokens

## Game Logic Flow

### Room Creation
1. Player creates room via frontend
2. Backend generates unique room code
3. Room stored in database and Redis
4. Board generated procedurally with seed
5. Host receives room ID and code

### Player Joining
1. Player enters room code
2. Backend validates code and capacity
3. Player added to room in database
4. Socket.IO broadcasts `room_updated` to all players
5. Board view updates with new player

### Game Play
1. Host starts game → `game_started` event
2. First player's turn begins
3. Player rolls dice → `roll_dice` event
4. Backend validates and processes → `dice_rolled` broadcast
5. Player moves → `move_player` event
6. Backend updates position → `player_moved` broadcast
7. If challenge tile → `challenge_started` event
8. Player completes challenge → `challenge_completed` event
9. Turn ends → `next_turn` event
10. Repeat until player reaches finish

### Real-time Synchronization
- All game state changes go through server
- Server validates all actions (anti-cheat)
- State changes broadcast to all connected clients
- Clients update UI based on received events

## Security Measures

1. **Server-Authoritative Logic**: All game logic runs on server
2. **Input Validation**: All inputs validated and sanitized
3. **Rate Limiting**: Prevent abuse of API endpoints
4. **Authentication**: Azure AD B2C for secure login
5. **HTTPS**: Enforced in production
6. **CORS**: Configured for allowed origins only
7. **SQL Injection**: Prevented via parameterized queries
8. **XSS**: Prevented via React's built-in escaping

## Scalability Considerations

1. **Horizontal Scaling**: 
   - Multiple backend instances
   - Redis pub/sub for cross-instance communication

2. **Database Connection Pooling**:
   - Managed connections to Azure SQL

3. **CDN**:
   - Static assets served via Azure CDN

4. **Caching**:
   - Redis for frequently accessed data
   - Reduced database load

5. **WebSocket Scaling**:
   - Sticky sessions via load balancer
   - Redis adapter for Socket.IO

## Monitoring and Observability

1. **Azure Monitor**:
   - Performance metrics
   - Resource utilization

2. **Application Insights**:
   - Request tracking
   - Dependency tracking
   - Exception logging

3. **Custom Logging**:
   - Structured logging
   - Log levels (info, warn, error)

## Future Enhancements

- [ ] Horizontal scaling with multiple backend instances
- [ ] Machine learning for challenge difficulty adjustment
- [ ] Video chat integration for remote players
- [ ] Tournament mode
- [ ] Custom board editor
- [ ] Achievement system
- [ ] Replay system
