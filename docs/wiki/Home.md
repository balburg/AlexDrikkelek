# Welcome to AlexDrikkelek Wiki! 🎲🎉

AlexDrikkelek is an online multiplayer board game inspired by La Oca (Goose Game) with dynamic challenges, trivia, and fun actions. Built for cross-device play with support for smartphones, tablets, and TV screens.

## Quick Links

- [Getting Started](./Getting-Started.md) - Installation and setup guide
- [User Guide](./User-Guide.md) - How to play the game with screenshots
- [Architecture](./Architecture.md) - System design and technical overview
- [API Reference](./API-Reference.md) - REST API and WebSocket events
- [Build and Run](./Build-and-Run.md) - Development environment setup
- [Deployment](./Deployment.md) - Azure deployment instructions
- [Troubleshooting](./Troubleshooting.md) - Common issues and solutions
- [Contributing](./Contributing.md) - How to contribute to the project

## What is AlexDrikkelek?

AlexDrikkelek is a progressive web application (PWA) that brings the classic board game experience to the digital age with modern features:

### 🎮 Game Features
- **Dynamic Challenges**: Trivia questions, fun actions, and interactive tasks
- **Multiplayer Support**: 2-10 players per room
- **Easy Code Sharing**: One-tap copy and native share buttons for quick room code distribution
- **Procedural Generation**: Every game board is unique
- **Real-time Gameplay**: Synchronized game state across all devices
- **Age-Appropriate Content**: Challenges tailored to different age groups

### 📱 Cross-Device Play
- **Smartphones/Tablets** → Player interface for controlling your game piece
- **TV/Big Screen** → Board display for shared gameplay experience
- **Chromecast Support** → Cast the board to your TV

### 🏗️ Technology Stack

**Frontend:**
- Next.js 14 with App Router
- React 18 + Tailwind CSS
- Socket.IO Client for real-time communication
- Progressive Web App (PWA) capabilities

**Backend:**
- Node.js 18+ with Fastify framework
- Socket.IO for WebSocket communication
- Azure SQL Database for data persistence
- Azure Cache for Redis for session management
- Azure Blob Storage for media assets

## Project Structure

```
AlexDrikkelek/
├── packages/
│   ├── frontend/              # Next.js PWA
│   │   ├── src/
│   │   │   ├── app/          # Next.js app directory
│   │   │   ├── components/   # React components
│   │   │   └── lib/          # Utilities and helpers
│   │   └── public/           # Static assets
│   │
│   └── backend/              # Node.js API
│       ├── src/
│       │   ├── config/       # Configuration
│       │   ├── controllers/  # Request handlers
│       │   ├── models/       # Data models
│       │   ├── services/     # Business logic
│       │   └── utils/        # Utilities
│       └── tests/            # Test files
│
├── database/                 # SQL schemas
├── docs/                     # Documentation
└── docker-compose.yml       # Local development setup
```

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Docker (optional, for containerized setup)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/balburg/AlexDrikkelek.git
   cd AlexDrikkelek
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Frontend
   cp packages/frontend/.env.example packages/frontend/.env.local
   
   # Backend
   cp packages/backend/.env.example packages/backend/.env
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

For detailed setup instructions, see [Getting Started](./Getting-Started.md).

## Key Features Status

- ✅ Procedural board generation (unique every time)
- ✅ Challenge system with categories and age ratings
- ✅ Real-time dice rolls and player movements
- ✅ Turn-based gameplay with automatic progression
- ✅ Room management (create, join, leave)
- ✅ Quick code sharing (copy & native share buttons)
- ✅ Player avatars and customization
- ✅ PWA-first approach for offline capabilities
- ✅ Cross-device synchronization
- ✅ Responsive design (mobile, tablet, desktop, TV)
- ✅ Color-blind friendly UI
- ✅ Server-authoritative game logic (anti-cheat)

## Resources

- **Repository**: https://github.com/balburg/AlexDrikkelek
- **Issues**: https://github.com/balburg/AlexDrikkelek/issues
- **License**: MIT

## Support

For questions, bug reports, or feature requests:
- Open an issue on [GitHub Issues](https://github.com/balburg/AlexDrikkelek/issues)
- Check the [Troubleshooting Guide](./Troubleshooting.md)

---

**Last updated:** 12-11-2025
