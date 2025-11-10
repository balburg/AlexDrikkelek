# Quick Start Guide

Get AlexDrikkelek up and running in minutes!

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Docker (optional, for containerized development)

## Installation

```bash
# Clone the repository
git clone https://github.com/balburg/AlexDrikkelek.git
cd AlexDrikkelek

# Install dependencies for all workspaces
npm install

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

## Running Locally

### Option 1: Run Both Services Simultaneously

```bash
# From the root directory
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

### Option 2: Run Services Separately

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

### Option 3: Docker Compose

```bash
docker-compose up
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Info**: http://localhost:3001/api

## Development Commands

### Backend

```bash
cd backend

# Development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

### Frontend

```bash
cd frontend

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

### Root (All Workspaces)

```bash
# Run dev servers for all services
npm run dev

# Build all services
npm run build

# Lint all code
npm run lint
```

## Testing the Setup

1. **Backend Health Check**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**
   Open http://localhost:3000 in your browser

3. **Socket.IO Connection**
   Check browser console for Socket.IO connection logs when accessing the frontend

## Environment Configuration

### Backend

Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration. For local development, the defaults work fine.

### Frontend

No environment file needed for basic local development. For production or API URL changes, create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Common Issues

### Port Already in Use

If ports 3000 or 3001 are in use:

```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or change the port
# Backend: Edit .env and set PORT=3002
# Frontend: Run with: PORT=3002 npm run dev
```

### Node Module Issues

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Clean up
docker-compose down
docker system prune -a

# Rebuild
docker-compose up --build
```

## Next Steps

- Read [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed development guide
- Check [AZURE_SETUP.md](./docs/AZURE_SETUP.md) for Azure deployment
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

## Need Help?

- Check the [README.md](./README.md) for more information
- Open an issue on GitHub
- Review the documentation in `/docs`

Happy coding! 🎮
