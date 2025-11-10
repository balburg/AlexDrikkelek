# AlexDrikkelek

An online board game inspired by La Oca (The Game of the Goose) with dynamic challenges, built with modern web technologies and Azure cloud services.

## 🎮 Game Concept

- **Players**: 2-10 per room
- **Cross-device gameplay**: 
  - Smartphones/Tablets for player interface
  - TV/Big Screen for board display
- **Procedural board generation**: Unique boards every game
- **Dynamic challenges**: Trivia, fun actions, categorized by type and age rating
- **Real-time multiplayer**: Dice rolls, turn logic, synchronized game state
- **Casting support**: Chromecast or similar technologies
- **PWA-first**: Maximum reach across all devices

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend** (`/frontend`): React + Next.js PWA with Tailwind CSS
- **Backend** (`/backend`): Node.js + Fastify REST API with Socket.IO
- **Infrastructure** (`/infrastructure`): Azure infrastructure configuration

## 🛠️ Technologies

### Frontend
- **React 19** + **Next.js 16** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Socket.IO Client** for real-time communication
- **Next-PWA** for Progressive Web App capabilities

### Backend
- **Node.js** + **Fastify** (REST API)
- **Socket.IO** for WebSocket connections
- **TypeScript** for type safety
- **ESM modules** for modern JavaScript

### Azure Services
- **Azure App Service**: Backend hosting
- **Azure Static Web Apps**: Frontend hosting (alternative)
- **Azure SignalR Service**: Scalable real-time communication
- **Azure SQL Database**: Structured data (rooms, players, challenges)
- **Azure Blob Storage**: Avatars and assets
- **Azure Cache for Redis**: Session management and pub/sub
- **Azure AD B2C**: Authentication (OAuth and guest login)
- **Azure Monitor + Application Insights**: Observability
- **Azure Container Registry**: Docker images
- **Azure Kubernetes Service (AKS)**: Container orchestration (optional)

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Local development
- **Azure DevOps Pipelines**: CI/CD
- **ESLint**: Code quality
- **TypeScript**: Type checking

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **Docker** and **Docker Compose** (for containerized development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/balburg/AlexDrikkelek.git
   cd AlexDrikkelek
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend - create .env.local if needed
   cd ../frontend
   ```

### Development

#### Option 1: Local Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Backend Health: http://localhost:3001/health

#### Option 2: Docker Compose

```bash
docker-compose up
```

This starts both frontend and backend in development mode with hot-reload.

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Linting

**Backend:**
```bash
cd backend
npm run lint
```

**Frontend:**
```bash
cd frontend
npm run lint
```

## 📁 Project Structure

```
AlexDrikkelek/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js App Router
│   ├── public/           # Static assets
│   ├── Dockerfile        # Frontend container
│   └── package.json
├── backend/              # Fastify backend server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── models/      # Data models
│   │   └── index.ts     # Entry point
│   ├── Dockerfile       # Backend container
│   └── package.json
├── infrastructure/       # Azure infrastructure as code
├── docs/                # Additional documentation
├── docker-compose.yml   # Local development setup
└── azure-pipelines.yml  # CI/CD pipeline
```

## 🔒 Security Features

- Server-authoritative game logic
- Anti-cheat mechanisms
- GDPR compliance
- Secure authentication with Azure AD B2C
- Environment-based configuration
- Input validation

## ♿ Accessibility

- Color-blind friendly design
- Multi-language support (i18n)
- Responsive design for all devices
- WCAG 2.1 compliance (planned)

## 📺 Casting

- Chromecast SDK integration
- Custom Web Receiver hosted on Azure Static Web Apps
- Separate player and board UI for optimal multi-screen experience

## 🚧 Development Roadmap

- [x] Project initialization
- [x] Monorepo structure
- [x] Frontend scaffolding (Next.js + PWA)
- [x] Backend scaffolding (Fastify + Socket.IO)
- [x] Docker configuration
- [x] Azure DevOps pipeline
- [ ] Database schema and migrations
- [ ] Authentication integration (Azure AD B2C)
- [ ] Real-time game room management
- [ ] Procedural board generation
- [ ] Challenge system
- [ ] Player UI
- [ ] Board UI (TV/Big Screen)
- [ ] Chromecast integration
- [ ] Localization (i18n)
- [ ] Comprehensive testing
- [ ] Production deployment

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📧 Contact

For questions or support, please open an issue on GitHub.

