# Build and Run Guide

Complete guide for building, testing, and running AlexDrikkelek in development mode.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Workflow](#development-workflow)
3. [Building the Project](#building-the-project)
4. [Running Tests](#running-tests)
5. [Linting and Code Quality](#linting-and-code-quality)
6. [Development Tools](#development-tools)
7. [Debugging](#debugging)
8. [Hot Reload](#hot-reload)

## Prerequisites

Before you begin development, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** for version control
- **Visual Studio Code** (recommended IDE)
- **Docker** (optional, for containerized development)

See [Getting Started](./Getting-Started.md) for installation instructions.

## Development Workflow

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/balburg/AlexDrikkelek.git
   cd AlexDrikkelek
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   # Frontend
   cp packages/frontend/.env.example packages/frontend/.env.local
   
   # Backend
   cp packages/backend/.env.example packages/backend/.env
   ```

3. **Run Development Servers**
   ```bash
   # Both frontend and backend together
   npm run dev
   
   # Or separately:
   npm run dev:frontend  # Frontend only
   npm run dev:backend   # Backend only
   ```

### Daily Development

```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Start development servers
npm run dev

# Make your changes...

# Run tests
npm test

# Lint your code
npm run lint

# Build before committing
npm run build

# Commit and push
git add .
git commit -m "Your commit message"
git push
```

## Building the Project

### Build All Packages

Build both frontend and backend:

```bash
npm run build
```

This runs:
- `packages/frontend`: Next.js production build
- `packages/backend`: TypeScript compilation

### Build Individual Packages

**Frontend Only:**
```bash
npm run build:frontend
# or
cd packages/frontend
npm run build
```

**Backend Only:**
```bash
npm run build:backend
# or
cd packages/backend
npm run build
```

### Build Outputs

**Frontend Build Output:**
```
packages/frontend/.next/        # Next.js build artifacts
packages/frontend/out/          # Static export (if configured)
```

**Backend Build Output:**
```
packages/backend/dist/          # Compiled JavaScript
packages/backend/dist/**/*.js   # Transpiled TypeScript
```

### Build Environment Variables

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL=https://your-backend.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://your-backend.azurewebsites.net
```

**Backend (.env):**
```bash
NODE_ENV=production
PORT=8080
```

### Clean Build

Remove all build artifacts:

```bash
# Clean all packages
npm run clean

# Clean individual packages
cd packages/frontend && npm run clean
cd packages/backend && npm run clean
```

## Running Tests

### Test All Packages

```bash
npm test
```

### Test Individual Packages

**Backend Tests:**
```bash
cd packages/backend
npm test
```

**Frontend Tests:**
```bash
cd packages/frontend
npm test
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- gameService.test.ts
```

### Test Coverage

View test coverage report:

```bash
cd packages/backend
npm test -- --coverage

# Coverage report generated at:
# packages/backend/coverage/lcov-report/index.html
```

**Opening Coverage Report:**
```bash
# Linux/Mac
open packages/backend/coverage/lcov-report/index.html

# Windows
start packages/backend/coverage/lcov-report/index.html
```

### Writing Tests

**Backend Test Example (Jest):**
```typescript
// packages/backend/tests/gameService.test.ts
import { describe, it, expect } from '@jest/globals';
import { GameService } from '../src/services/gameService';

describe('GameService', () => {
  it('should roll dice between 1 and 6', () => {
    const result = GameService.rollDice();
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });
});
```

**Frontend Test Example (React Testing Library):**
```typescript
// packages/frontend/src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('renders game mode selection', () => {
    render(<Home />);
    expect(screen.getByText('Player View')).toBeInTheDocument();
    expect(screen.getByText('Board View')).toBeInTheDocument();
  });
});
```

## Linting and Code Quality

### Run Linters

```bash
# Lint all packages
npm run lint

# Lint frontend only
npm run lint --workspace=frontend

# Lint backend only
npm run lint --workspace=backend
```

### Auto-Fix Linting Issues

```bash
# Auto-fix all packages
npm run lint -- --fix

# Auto-fix frontend
cd packages/frontend
npm run lint -- --fix

# Auto-fix backend
cd packages/backend
npm run lint -- --fix
```

### ESLint Configuration

**Frontend (.eslintrc.json):**
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Backend (.eslintrc.json):**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Code Formatting (Prettier)

```bash
# Format all code
npx prettier --write .

# Check formatting
npx prettier --check .

# Format specific directory
npx prettier --write packages/frontend/src/**/*.{ts,tsx}
```

### Type Checking

```bash
# TypeScript type check (frontend)
cd packages/frontend
npx tsc --noEmit

# TypeScript type check (backend)
cd packages/backend
npx tsc --noEmit
```

## Development Tools

### Recommended VS Code Extensions

- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript Vue Plugin** - TypeScript support
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **GitLens** - Git integration
- **Thunder Client** - API testing
- **Error Lens** - Inline error messages

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Package Scripts

**Root package.json:**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "clean": "npm run clean --workspaces && rm -rf node_modules"
  }
}
```

**Frontend package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "clean": "rm -rf .next out"
  }
}
```

**Backend package.json:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/**/*.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "clean": "rm -rf dist"
  }
}
```

## Debugging

### Frontend Debugging (Next.js)

**VS Code Debug Configuration (.vscode/launch.json):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/packages/frontend"
    },
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/frontend/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/packages/frontend"
    }
  ]
}
```

**Browser DevTools:**
- Press F12 to open Chrome DevTools
- Use Console tab for logs
- Use Network tab for API requests
- Use Sources tab to set breakpoints

### Backend Debugging (Node.js)

**VS Code Debug Configuration:**
```json
{
  "name": "Debug Backend",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/packages/backend/src/index.ts",
  "cwd": "${workspaceFolder}/packages/backend",
  "runtimeExecutable": "node",
  "runtimeArgs": ["--loader", "tsx"],
  "skipFiles": ["<node_internals>/**"]
}
```

**Debug with tsx:**
```bash
cd packages/backend
node --inspect --loader tsx src/index.ts
```

Then open Chrome and navigate to `chrome://inspect`.

### Logging

**Backend Logging:**
```typescript
import { logger } from './utils/logger';

logger.info('Game created', { roomId, playerCount });
logger.warn('Player timeout', { playerId });
logger.error('Database error', { error });
```

**Frontend Logging:**
```typescript
console.log('Player joined:', playerData);
console.warn('WebSocket reconnecting...');
console.error('Failed to load room:', error);
```

### Network Debugging

**Monitor WebSocket Traffic:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSockets)
4. Click on socket connection to see messages

**Monitor HTTP Requests:**
1. Network tab → "XHR" or "Fetch"
2. Click request to see headers, payload, response

## Hot Reload

### Frontend Hot Reload

Next.js provides automatic hot reload:
- Changes to `.tsx`, `.ts`, `.css` files trigger reload
- Fast Refresh preserves React state
- No manual restart needed

**Disable Fast Refresh (if needed):**
```bash
# In .env.local
NEXT_DISABLE_FAST_REFRESH=true
```

### Backend Hot Reload

Using `tsx watch`:
- Automatically restarts on file changes
- Changes to `.ts` files trigger reload
- WebSocket connections will disconnect/reconnect

**Manual Restart:**
```bash
# Stop backend (Ctrl+C)
# Start again
npm run dev:backend
```

## Environment-Specific Builds

### Development Build

```bash
NODE_ENV=development npm run build
```

- Source maps included
- Development warnings enabled
- Verbose logging

### Production Build

```bash
NODE_ENV=production npm run build
```

- Minified and optimized
- Source maps excluded (or separate files)
- Production warnings only

### Staging Build

```bash
NODE_ENV=staging npm run build
```

- Similar to production
- Additional debug endpoints enabled
- Test data allowed

## Performance Optimization

### Analyze Bundle Size (Frontend)

```bash
cd packages/frontend
npm run build
npx @next/bundle-analyzer
```

### Monitor Build Time

```bash
time npm run build
```

### Optimize Dependencies

```bash
# Find outdated packages
npm outdated

# Update packages
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

## Continuous Integration

The project uses Azure DevOps Pipelines (see `azure-pipelines.yml`):

**Pipeline Stages:**
1. Install dependencies
2. Lint code
3. Run tests
4. Build project
5. Run security audit
6. Deploy (if on main branch)

**Run CI Steps Locally:**
```bash
npm install
npm run lint
npm test
npm run build
npm audit
```

## Related Documentation

- [Getting Started](./Getting-Started.md) - Initial setup
- [Testing](./Testing.md) - Detailed testing guide
- [Deployment](./Deployment.md) - Production deployment
- [Contributing](./Contributing.md) - Contribution guidelines

---

**Last updated:** 12-11-2024
