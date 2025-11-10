# AlexDrikkelek

An online multiplayer board game inspired by La Oca (Goose Game) with dynamic challenges, trivia, and fun actions. Built for cross-device play with support for smartphones, tablets, and TV screens.

## 🎮 Game Concept

AlexDrikkelek is a progressive web application (PWA) that brings the classic board game experience to the digital age with:

- **Dynamic Challenges**: Trivia questions, fun actions, and interactive tasks
- **Multiplayer Support**: 2-10 players per room
- **Cross-Device Play**: 
  - Smartphones/Tablets → Player interface for controlling your piece
  - TV/Big Screen → Board display for shared gameplay
- **Procedural Generation**: Every game board is unique
- **Real-time Gameplay**: Synchronized game state across all devices
- **Casting Support**: Chromecast integration for TV display

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend** (`packages/frontend`): Next.js PWA with React
- **Backend** (`packages/backend`): Node.js API with Fastify and Socket.IO

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: React 18 + Tailwind CSS
- **Real-time**: Socket.IO Client
- **PWA**: Progressive Web App capabilities
- **Casting**: Chromecast SDK integration

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **WebSockets**: Socket.IO
- **Database**: Azure SQL Database
- **Caching**: Azure Cache for Redis
- **Storage**: Azure Blob Storage

#### Azure Services
- **Hosting**: Azure App Service (Backend), Azure Static Web Apps (Frontend)
- **Database**: Azure SQL Database
- **Cache**: Azure Cache for Redis
- **Storage**: Azure Blob Storage
- **Auth**: Azure AD B2C
- **Observability**: Azure Monitor + Application Insights
- **CI/CD**: Azure DevOps Pipelines

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Azure account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/balburg/AlexDrikkelek.git
cd AlexDrikkelek
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

**Frontend** (`packages/frontend/.env.local`):
```bash
cp packages/frontend/.env.example packages/frontend/.env.local
# Edit .env.local with your configuration
```

**Backend** (`packages/backend/.env`):
```bash
cp packages/backend/.env.example packages/backend/.env
# Edit .env with your Azure credentials
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Frontend only (http://localhost:3000)
npm run dev:frontend

# Backend only (http://localhost:3001)
npm run dev:backend
```

### Building

Build all packages:
```bash
npm run build
```

Build individually:
```bash
npm run build:frontend
npm run build:backend
```

### Testing

Run tests for all packages:
```bash
npm test
```

### Linting

Run linters for all packages:
```bash
npm run lint
```

## 🐳 Docker

Run the entire application with Docker Compose:

```bash
docker-compose up
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001
- Redis on localhost:6379

## 🎯 Key Features

### Game Features
- ✅ Procedural board generation (unique every time)
- ✅ Challenge system with categories and age ratings
- ✅ Real-time dice rolls and player movements
- ✅ Turn-based gameplay with automatic progression
- ✅ Room management (create, join, leave)
- ✅ Player avatars and customization

### Technical Features
- ✅ PWA-first approach for offline capabilities
- ✅ Cross-device synchronization
- ✅ Responsive design (mobile, tablet, desktop, TV)
- ✅ Color-blind friendly UI
- ✅ Multi-language support (i18n ready)
- ✅ Server-authoritative game logic (anti-cheat)
- ✅ GDPR compliant
- ✅ Real-time WebSocket communication

## 📁 Project Structure

```
AlexDrikkelek/
├── packages/
│   ├── frontend/              # Next.js PWA
│   │   ├── src/
│   │   │   ├── app/          # Next.js app directory
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities and helpers
│   │   │   └── styles/       # Global styles
│   │   ├── public/           # Static assets
│   │   └── Dockerfile
│   │
│   └── backend/              # Node.js API
│       ├── src/
│       │   ├── config/       # Configuration
│       │   ├── controllers/  # Request handlers
│       │   ├── models/       # Data models
│       │   ├── routes/       # API routes
│       │   ├── services/     # Business logic
│       │   └── utils/        # Utilities
│       └── Dockerfile
│
├── azure-pipelines.yml       # CI/CD configuration
├── docker-compose.yml        # Local development
└── README.md
```

## 🔐 Security

- Server-authoritative game logic prevents cheating
- Azure AD B2C for authentication
- HTTPS enforced in production
- Input validation and sanitization
- Rate limiting on API endpoints
- GDPR compliance with data privacy controls

## 🌍 Accessibility & Localization

- Color-blind friendly palette
- WCAG 2.1 Level AA compliant
- Multi-language support (i18n)
- Screen reader compatible
- Keyboard navigation support

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For issues, questions, or contributions, please open an issue on GitHub.

## 🎉 Acknowledgments

- Inspired by the classic La Oca (Goose Game)
- Built with modern web technologies
- Powered by Microsoft Azure
