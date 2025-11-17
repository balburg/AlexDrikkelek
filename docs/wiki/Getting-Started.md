# Getting Started with AlexDrikkelek

This guide will help you set up and run AlexDrikkelek locally for development or testing.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 24.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 10.0.0 or higher (comes with Node.js)
- **Git** for cloning the repository

### Optional
- **Docker** and **Docker Compose** for containerized development
- **Azure CLI** for cloud deployments
- **Visual Studio Code** (recommended IDE)

### Verify Installation

Check your installed versions:

```bash
node --version   # Should show v24.0.0 or higher
npm --version    # Should show 10.0.0 or higher
git --version    # Any recent version
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/balburg/AlexDrikkelek.git
cd AlexDrikkelek
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm install
```

This will install dependencies for:
- Root workspace
- Frontend package (`packages/frontend`)
- Backend package (`packages/backend`)

### 3. Environment Configuration

#### Frontend Environment Variables

Create a local environment file for the frontend:

```bash
cp packages/frontend/.env.example packages/frontend/.env.local
```

Edit `packages/frontend/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Note: Authentication is disabled - game operates anonymously

# Feature Flags
NEXT_PUBLIC_ENABLE_CHROMECAST=true
NEXT_PUBLIC_MAX_PLAYERS=10
NEXT_PUBLIC_MIN_PLAYERS=2
```

#### Backend Environment Variables

Create a local environment file for the backend:

```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env`:

```bash
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# CORS (allow frontend during development)
CORS_ORIGIN=http://localhost:3000

# Database (optional for basic features)
DB_SERVER=localhost
DB_DATABASE=alexdrikkelek
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_ENCRYPT=false

# Azure services (optional for local development)
# Leave these empty for basic local testing
```

> **Note:** For basic local development and testing, you can run the application without Azure SQL. The backend uses in-memory storage for session management.

### 4. Run the Application

#### Option A: Run Both Frontend and Backend Together

```bash
npm run dev
```

This starts:
- **Frontend** on http://localhost:3000
- **Backend** on http://localhost:3001

#### Option B: Run Separately

Run frontend only:
```bash
npm run dev:frontend
```

Run backend only:
```bash
npm run dev:backend
```

### 5. Access the Application

Open your browser and navigate to:
- **Main Page**: http://localhost:3000
- **Player View**: http://localhost:3000/player
- **Board View**: http://localhost:3000/board
- **API Health**: http://localhost:3001/health

## Using Docker (Alternative Setup)

If you prefer using Docker for a consistent environment:

### 1. Install Docker

Download and install Docker Desktop:
- [Docker for Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Docker for Mac](https://docs.docker.com/desktop/install/mac-install/)
- [Docker for Linux](https://docs.docker.com/desktop/install/linux-install/)

### 2. Run with Docker Compose

```bash
docker-compose up
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

To run in detached mode:
```bash
docker-compose up -d
```

To stop the containers:
```bash
docker-compose down
```

## Database Setup (Optional)

For full functionality, you'll need a database. You have two options:

### Option 1: Local SQL Server with Docker

```bash
# Start SQL Server container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2022-latest

# Wait for SQL Server to start (about 10 seconds)
sleep 10

# Create database and run schema
# (You'll need to run the schema script manually or via a tool)
```

### Option 2: Azure SQL Database

See the [Deployment Guide](./Deployment.md) for setting up Azure resources.

## Verification Steps

After starting the application, verify everything is working:

### 1. Check Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-12T10:00:00.000Z"
}
```

### 2. Check Frontend

Open http://localhost:3000 in your browser. You should see:
- AlexDrikkelek landing page
- Two cards: "Player View" and "Board View"

### 3. Test Player View

1. Navigate to http://localhost:3000/player
2. You should see the player interface
3. Create a game and test the new code sharing features:
   - **Copy Code** button: Click to copy room code to clipboard
   - **Share** button: Test native sharing (works best on mobile)

### 4. Test Board View

1. Navigate to http://localhost:3000/board
2. You should see the game board display
3. Enter a game code and test the **Copy Game Code** button

## Next Steps

Now that you have the application running:

1. **Learn How to Play**: Read the [User Guide](./User-Guide.md)
2. **Explore Features**: Check out the [Features Guide](./Features.md) for detailed feature documentation
3. **Understand the Architecture**: Check the [Architecture](./Architecture.md) docs
4. **Start Development**: See the [Build and Run](./Build-and-Run.md) guide
5. **Contribute**: Read the [Contributing](./Contributing.md) guidelines

## Common Issues

### Port Already in Use

If you see "Port 3000 is already in use" or "Port 3001 is already in use":

```bash
# Find and kill the process using the port (Linux/Mac)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies Not Installing

If `npm install` fails:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules

# Reinstall
npm install
```

### WebSocket Connection Errors

If the frontend can't connect to the backend via WebSocket:

1. Verify the backend is running on port 3001
2. Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
3. Check browser console for CORS errors
4. Verify firewall settings aren't blocking the connection

For more troubleshooting help, see the [Troubleshooting Guide](./Troubleshooting.md).

## Additional Resources

- [Build and Run Guide](./Build-and-Run.md) - Detailed build and test instructions
- [API Reference](./API-Reference.md) - REST API and WebSocket documentation
- [GitHub Repository](https://github.com/balburg/AlexDrikkelek) - Source code

---

**Last updated:** 17-11-2025
