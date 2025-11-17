# Architecture Documentation

## System Overview

AlexDrikkelek is a real-time multiplayer board game platform built on a modern client-server architecture with WebSocket communication for real-time gameplay synchronization.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Player Devices<br/>Smartphones/Tablets]
        B[Board Display<br/>TV/Big Screen]
    end
    
    subgraph "Application Layer"
        C[Next.js Frontend<br/>PWA]
        D[Fastify Backend<br/>+ Socket.IO]
    end
    
    subgraph "Data Layer"
        E[Azure SQL<br/>Database]
        F[In-Memory<br/>Storage]
        G[Azure Blob<br/>Storage]
    end
    
    subgraph "Services Layer"
        H[Anonymous Access<br/>No Authentication]
        I[Azure Monitor<br/>Application Insights]
    end
    
    A -->|HTTP/WebSocket| C
    B -->|HTTP/WebSocket| C
    C -->|Socket.IO| D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    C --> I
```

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI component library |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Socket.IO Client | 4.x | Real-time WebSocket communication |
| PWA | Latest | Progressive Web App capabilities |

**Frontend Features:**
- Server-Side Rendering (SSR) for initial load
- Client-Side Rendering (CSR) for real-time updates
- Progressive Web App (offline support, installable)
- Responsive design (mobile-first approach)
- Real-time state synchronization

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x LTS | JavaScript runtime |
| Fastify | 4.x | High-performance HTTP server |
| Socket.IO | 4.x | WebSocket server |
| TypeScript | 5.x | Type-safe development |
| mssql | Latest | Azure SQL Database client |

**Backend Features:**
- RESTful API endpoints
- WebSocket server for real-time events
- Server-authoritative game logic (anti-cheat)
- Database connection pooling
- In-memory state management (single instance deployment)
- Structured logging

### Azure Services

| Service | Purpose | Environment |
|---------|---------|-------------|
| Azure Static Web Apps | Frontend hosting | Production |
| Azure App Service | Backend hosting (single instance with ARR affinity) | Production |
| Azure SQL Database | Data persistence | Production |
| Azure Blob Storage | Media assets (avatars, icons) | Production |
| Anonymous Access | No authentication (players use name + avatar) | Production |
| Azure Monitor | Performance monitoring | Production |
| Application Insights | Request tracking, logging | Production |
| Azure DevOps Pipelines | CI/CD automation | All |

**Note:** The backend runs as a single instance with in-memory state management. ARR affinity (sticky sessions) must be enabled on Azure App Service to ensure all WebSocket connections for a room stay on the same instance.

## Component Architecture

### Frontend Components

```
packages/frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home page (game mode selection)
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── player/
│   │   │   ├── page.tsx       # Player view entry point
│   │   │   └── PlayerGame.tsx # Player game logic
│   │   └── board/
│   │       ├── page.tsx       # Board view entry point
│   │       └── BoardGame.tsx  # Board display logic
│   │
│   ├── components/            # Reusable React components
│   │   └── ChallengeModal.tsx # Challenge display modal
│   │
│   ├── lib/                   # Utilities and helpers
│   │   └── SocketProvider.tsx # Socket.IO context provider
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── game.ts           # Game-related types
│   │
│   └── styles/               # Global styles
│       └── globals.css       # Tailwind CSS + custom styles
│
└── public/                   # Static assets
    ├── icons/               # PWA icons
    └── images/             # Game assets
```

### Backend Services

```
packages/backend/
├── src/
│   ├── index.ts              # Application entry point
│   │
│   ├── config/               # Configuration
│   │   ├── database.ts       # Database connection
│   │   ├── inMemoryStore.ts  # In-memory storage
│   │   └── env.ts           # Environment variables
│   │
│   ├── models/               # Data models
│   │   ├── Player.ts         # Player entity
│   │   ├── GameRoom.ts       # Game room entity
│   │   └── Challenge.ts      # Challenge entity
│   │
│   ├── services/             # Business logic
│   │   ├── gameService.ts    # Game logic (dice, movement, turns)
│   │   ├── challengeService.ts # Challenge management
│   │   ├── roomService.ts    # Room management
│   │   └── boardService.ts   # Board generation
│   │
│   └── utils/                # Utilities
│       ├── logger.ts         # Logging utility
│       └── validators.ts     # Input validation
│
└── tests/                    # Test files
    ├── gameService.test.ts
    └── challengeService.test.ts
```

## Data Flow Architecture

### Game Creation Flow

```mermaid
sequenceDiagram
    participant P as Player
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    P->>F: Create Game (name)
    F->>B: Socket: CREATE_ROOM
    B->>B: Generate Room Code
    B->>B: Generate Board
    B->>DB: Store Room
    B->>B: Cache Room State (In-Memory)
    B->>F: ROOM_UPDATED
    F->>P: Display PIN
```

### Gameplay Flow

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant P2 as Player 2
    participant TV as Board Display
    participant B as Backend
    
    P1->>B: ROLL_DICE
    B->>B: Validate Turn
    B->>B: Generate Random (1-6)
    B->>B: Update In-Memory State
    B-->>P1: DICE_ROLLED
    B-->>P2: DICE_ROLLED
    B-->>TV: DICE_ROLLED
    
    P1->>B: MOVE_PLAYER
    B->>B: Calculate New Position
    B->>B: Check Tile Type
    B-->>P1: PLAYER_MOVED
    B-->>P2: PLAYER_MOVED
    B-->>TV: PLAYER_MOVED
    
    alt Challenge Tile
        B->>B: Get Random Challenge
        B-->>P1: CHALLENGE_STARTED
        B-->>P2: CHALLENGE_STARTED
        B-->>TV: CHALLENGE_STARTED
        P1->>B: CHALLENGE_COMPLETED
        B-->>P1: TURN_CHANGED
        B-->>P2: TURN_CHANGED
        B-->>TV: TURN_CHANGED
    else Normal Tile
        B-->>P1: TURN_CHANGED
        B-->>P2: TURN_CHANGED
        B-->>TV: TURN_CHANGED
    end
```

## Database Schema

### Core Tables

**Players Table**
```sql
CREATE TABLE Players (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    last_active DATETIME2 DEFAULT GETUTCDATE()
);
```

**GameRooms Table**
```sql
CREATE TABLE GameRooms (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code NVARCHAR(6) UNIQUE NOT NULL,
    host_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Players(id),
    status NVARCHAR(20) NOT NULL, -- 'waiting', 'active', 'finished'
    max_players INT DEFAULT 10,
    board_seed INT NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    started_at DATETIME2,
    finished_at DATETIME2
);
```

**RoomPlayers Table**
```sql
CREATE TABLE RoomPlayers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    room_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES GameRooms(id),
    player_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Players(id),
    position INT DEFAULT 0,
    turn_order INT NOT NULL,
    joined_at DATETIME2 DEFAULT GETUTCDATE()
);
```

**Challenges Table**
```sql
CREATE TABLE Challenges (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    type NVARCHAR(20) NOT NULL, -- 'trivia', 'action', 'dare', 'drinking'
    category NVARCHAR(50),
    question NVARCHAR(500) NOT NULL,
    options NVARCHAR(MAX), -- JSON array for multiple choice
    correct_answer NVARCHAR(200),
    age_rating NVARCHAR(10), -- 'kids', 'teens', 'adults'
    difficulty INT DEFAULT 1, -- 1-5
    created_at DATETIME2 DEFAULT GETUTCDATE()
);
```

For the complete schema, see [`/database/schema.sql`](https://github.com/balburg/AlexDrikkelek/blob/main/database/schema.sql).

## In-Memory Storage

The backend uses an in-memory storage system for session and state management in a single-instance deployment model.

### Storage Structure

**Stored Data:**
- Game room state
- Player sessions
- Room code lookups
- Active players per room

**Features:**
- Automatic expiration of old data
- Key-based storage with TTL support
- Set operations for player lists
- Pattern-based key retrieval

**Important:** The backend must run as a single instance with ARR affinity (sticky sessions) enabled to ensure all connections for a room stay on the same server instance.

## API Endpoints

### REST API

Source: [`docs/API.md`](https://github.com/balburg/AlexDrikkelek/blob/main/docs/API.md)

```
GET  /health                     # Health check
GET  /api/ping                   # Connectivity test
POST /api/rooms                  # Create game room
GET  /api/rooms/:id              # Get room details
POST /api/rooms/:id/join         # Join room
GET  /api/challenges/random      # Get random challenge
```

### WebSocket Events

#### Client → Server

```typescript
- create_room: { playerName, maxPlayers }
- join_room: { code, playerName }
- leave_room: { roomId, playerId }
- start_game: { roomId }
- roll_dice: { roomId, playerId }
- move_player: { roomId, playerId, diceRoll }
- challenge_completed: { roomId, playerId, success }
```

#### Server → Client

```typescript
- room_updated: { room: GameRoom }
- game_started: { room: GameRoom }
- dice_rolled: { playerId, playerName, diceRoll }
- player_moved: { playerId, playerName, newPosition, tile }
- challenge_started: { playerId, playerName, tile, challenge }
- challenge_completed: { playerId, playerName, success }
- turn_changed: { currentTurn, currentPlayer }
- game_ended: { winnerId, winnerName, stats }
- error: { message }
```

## Security Architecture

### Anonymous Access

The game operates with anonymous access for simplicity and ease of use.

```mermaid
graph LR
    A[Player] -->|1. Enter Name + Avatar| B[Frontend]
    B -->|2. Create/Join Room| C[Backend]
    C -->|3. Generate Session ID| D[In-Memory Store]
    D -->|4. Session Stored| C
    C -->|5. Room Info| B
    B -->|6. Store Session in localStorage| A
    A -->|7. Play Game| C
```

**Benefits:**
- Lower barrier to entry
- Faster game start
- Privacy-friendly (no personal data required)
- Simplified infrastructure
- Easy reconnection via session IDs

**Security Measures:**

1. **Server-Authoritative Logic**
   - All game logic runs on the server
   - Clients cannot manipulate game state directly
   - Dice rolls generated server-side (anti-cheat)

2. **Input Validation**
   - All inputs sanitized and validated
   - TypeScript type checking
   - Schema validation with Joi/Zod

3. **Rate Limiting**
   - API endpoints protected from abuse
   - In-memory rate limiting
   - Per-IP and per-user limits

4. **HTTPS/WSS**
   - All communication encrypted in production
   - TLS 1.2+ required

5. **CORS Configuration**
   - Whitelist of allowed origins
   - Credentials included only for trusted domains

6. **SQL Injection Prevention**
   - Parameterized queries only
   - ORM/query builder usage

7. **XSS Prevention**
   - React's built-in escaping
   - Content Security Policy headers

## Scalability Design

### Single-Instance Deployment

The current architecture is designed for single-instance deployment with sticky sessions.

```
┌─────────────────┐
│   Azure App     │
│    Service      │
│  (Backend 1)    │
│  + Socket.IO    │
│  + In-Memory    │
│     Storage     │
└────────┬────────┘
         │
         ├──→ Azure SQL Database
         ├──→ Azure Blob Storage
         └──→ Application Insights
```

**Deployment Requirements:**

1. **Sticky Sessions (ARR Affinity)**
   - ARR affinity must be enabled on Azure App Service
   - Ensures all WebSocket connections for a room stay on the same instance
   - Required for in-memory state management

2. **Database Connection Pooling**
   - Reuse database connections
   - Prevents connection exhaustion

3. **CDN for Static Assets**
   - Azure CDN for frontend assets
   - Reduced backend load

**Note on Horizontal Scaling:**
The current implementation uses in-memory storage and is designed for single-instance deployment. For horizontal scaling (multiple backend instances), consider migrating to a distributed cache solution like Redis.

## Monitoring & Observability

### Application Insights Integration

**Tracked Metrics:**
- Request duration and throughput
- Dependency calls (DB, External APIs)
- Exception tracking and stack traces
- Custom events (game created, game started, challenge completed)
- User sessions and active players

**Custom Logging:**
```typescript
logger.info('Game created', { roomId, playerCount });
logger.warn('Player timeout', { playerId, roomId });
logger.error('Database connection failed', { error });
```

### Performance Monitoring

**Key Performance Indicators (KPIs):**
- API response time (p50, p95, p99)
- WebSocket message latency
- Database query performance
- Cache hit/miss ratio
- Active games and players
- Error rate

## Deployment Architecture

### Production Environment

```
Internet
   │
   ├─→ Azure CDN
   │      ├─→ Static Assets (images, fonts)
   │      └─→ Frontend App (cached)
   │
   ├─→ Azure Static Web Apps
   │      └─→ Next.js Frontend
   │             │
   │             └─→ Socket.IO Client
   │
   └─→ Azure App Service (ARR Affinity Enabled)
          └─→ Fastify Backend + Socket.IO
                 │
                 ├─→ Azure SQL Database
                 ├─→ In-Memory Storage
                 ├─→ Azure Blob Storage
                 └─→ Application Insights
```

**Note:** Authentication is intentionally disabled. The system operates anonymously. The backend runs as a single instance with ARR affinity (sticky sessions) enabled.

### CI/CD Pipeline

See [Deployment Guide](./Deployment.md) for detailed deployment instructions.

**Pipeline Stages:**
1. Source: GitHub repository
2. Build: npm install + npm run build
3. Test: npm test
4. Security Scan: npm audit, Snyk
5. Deploy to Staging
6. Integration Tests
7. Deploy to Production
8. Smoke Tests

## Future Enhancements

- [ ] Horizontal scaling with distributed cache (Redis) for multiple backend instances
- [ ] Machine learning for challenge difficulty adjustment
- [ ] Video chat integration (WebRTC)
- [ ] Tournament mode with brackets
- [ ] Custom board editor
- [ ] Achievement system
- [ ] Replay system with playback
- [ ] Mobile native apps (React Native)
- [ ] Offline mode with local multiplayer

## References

- [API Reference](./API-Reference.md)
- [Deployment Guide](./Deployment.md)
- [Build and Run Guide](./Build-and-Run.md)
- [GitHub Repository](https://github.com/balburg/AlexDrikkelek)

---

**Last updated:** 17-11-2025
