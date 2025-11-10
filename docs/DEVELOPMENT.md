# Development Guide

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Docker and Docker Compose (optional)
- Azure CLI (for deployment)

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/balburg/AlexDrikkelek.git
cd AlexDrikkelek

# Backend
cd backend
npm install
cp .env.example .env

# Frontend  
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env` with your local configuration:

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Run Development Servers

**Option A: Manual**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option B: Docker Compose**

```bash
docker-compose up
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Project Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/          # Configuration (env, constants)
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models & types
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Frontend (`/frontend`)

```
frontend/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── ...             # Other pages/routes
├── public/             # Static assets
│   └── manifest.json   # PWA manifest
├── Dockerfile
├── next.config.ts      # Next.js configuration
└── package.json
```

## Development Workflow

### Making Changes

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes

3. Run linting
   ```bash
   # Backend
   cd backend && npm run lint
   
   # Frontend
   cd frontend && npm run lint
   ```

4. Build to verify
   ```bash
   # Backend
   cd backend && npm run build
   
   # Frontend
   cd frontend && npm run build
   ```

5. Commit and push
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature
   ```

### Adding Dependencies

**Backend:**
```bash
cd backend
npm install <package-name>
npm install -D <dev-package-name>  # For dev dependencies
```

**Frontend:**
```bash
cd frontend
npm install <package-name>
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types/interfaces
- Avoid `any` type where possible

### ESLint

Both projects use ESLint for code quality:

```bash
npm run lint        # Check for issues
npm run lint --fix  # Auto-fix issues
```

## Real-time Communication (Socket.IO)

### Backend Socket Events

The backend Socket.IO server is configured in `src/index.ts`:

```typescript
io.on('connection', (socket) => {
  // Handle client connection
  
  socket.on('event-name', (data) => {
    // Handle custom events
  });
  
  socket.on('disconnect', () => {
    // Handle disconnection
  });
});
```

### Frontend Socket Client

Create a Socket.IO client in the frontend:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

## Database Migrations

(To be implemented)

For Azure SQL Database, we'll use a migration tool like:
- Prisma
- TypeORM
- Knex.js

## Testing

(To be implemented)

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Building for Production

### Backend

```bash
cd backend
npm run build      # TypeScript compilation
npm start          # Run production server
```

### Frontend

```bash
cd frontend
npm run build      # Next.js production build
npm start          # Start production server
```

### Docker

```bash
# Build images
docker-compose build

# Run in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Debugging

### Backend

Use VS Code debugger or:

```bash
cd backend
node --inspect dist/index.js
```

### Frontend

Next.js has built-in debugging. Use VS Code or browser DevTools.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Node Modules Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Clean up containers and images
docker-compose down
docker system prune -a
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://fastify.dev/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Azure Documentation](https://docs.microsoft.com/azure)
