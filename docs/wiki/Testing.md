# Testing Guide

Comprehensive testing guide for AlexDrikkelek.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Running Tests](#running-tests)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Test Coverage](#test-coverage)
7. [Writing Good Tests](#writing-good-tests)

## Testing Overview

AlexDrikkelek uses multiple testing strategies:

| Type | Tool | Purpose |
|------|------|---------|
| Unit Tests | Jest | Test individual functions and components |
| Integration Tests | Jest + Supertest | Test API endpoints and services |
| E2E Tests | Playwright (planned) | Test full user workflows |
| Component Tests | React Testing Library | Test React components |

### Test Structure

```
packages/
├── backend/
│   ├── src/
│   │   └── services/
│   │       └── gameService.ts
│   └── tests/
│       └── gameService.test.ts
│
└── frontend/
    ├── src/
    │   └── components/
    │       └── PlayerCard.tsx
    └── __tests__/
        └── PlayerCard.test.tsx
```

## Running Tests

### Run All Tests

```bash
# From root directory
npm test

# Watch mode (re-runs on file changes)
npm test -- --watch
```

### Run Specific Package Tests

**Backend Tests Only:**
```bash
cd packages/backend
npm test
```

**Frontend Tests Only:**
```bash
cd packages/frontend
npm test
```

### Run Specific Test File

```bash
# Backend
cd packages/backend
npm test -- gameService.test.ts

# Frontend
cd packages/frontend
npm test -- PlayerCard.test.tsx
```

### Run with Coverage

```bash
npm test -- --coverage
```

Coverage report generated at:
- Backend: `packages/backend/coverage/lcov-report/index.html`
- Frontend: `packages/frontend/coverage/lcov-report/index.html`

### Run in CI Mode

```bash
# Run once, no watch
npm test -- --ci
```

## Unit Testing

### Backend Unit Tests

Backend tests use Jest for testing services and utilities.

**Example: Testing Game Service**

```typescript
// packages/backend/tests/gameService.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { GameService } from '../src/services/gameService';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
  });

  describe('rollDice', () => {
    it('should return a number between 1 and 6', () => {
      const result = gameService.rollDice();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });

    it('should return different values on multiple calls', () => {
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(gameService.rollDice());
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('calculateNewPosition', () => {
    it('should add dice roll to current position', () => {
      const currentPosition = 5;
      const diceRoll = 3;
      const newPosition = gameService.calculateNewPosition(currentPosition, diceRoll);
      expect(newPosition).toBe(8);
    });

    it('should handle wrap-around at board end', () => {
      const currentPosition = 48;
      const diceRoll = 5;
      const boardSize = 50;
      const newPosition = gameService.calculateNewPosition(currentPosition, diceRoll, boardSize);
      expect(newPosition).toBe(3); // Wrapped around
    });
  });
});
```

**Running Backend Tests:**
```bash
cd packages/backend
npm test
```

### Frontend Unit Tests

Frontend tests use Jest and React Testing Library.

**Example: Testing React Component**

```typescript
// packages/frontend/__tests__/PlayerCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerCard from '../src/components/PlayerCard';

describe('PlayerCard', () => {
  const mockPlayer = {
    id: '1',
    name: 'Alex',
    position: 0,
    turnOrder: 0,
    isHost: true,
  };

  it('renders player name', () => {
    render(<PlayerCard player={mockPlayer} isCurrentTurn={false} />);
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });

  it('shows roll button when it is current turn', () => {
    const onRollDice = jest.fn();
    render(
      <PlayerCard 
        player={mockPlayer} 
        isCurrentTurn={true} 
        onRollDice={onRollDice} 
      />
    );
    expect(screen.getByText('Roll Dice')).toBeInTheDocument();
  });

  it('hides roll button when not current turn', () => {
    render(<PlayerCard player={mockPlayer} isCurrentTurn={false} />);
    expect(screen.queryByText('Roll Dice')).not.toBeInTheDocument();
  });

  it('calls onRollDice when button is clicked', () => {
    const onRollDice = jest.fn();
    render(
      <PlayerCard 
        player={mockPlayer} 
        isCurrentTurn={true} 
        onRollDice={onRollDice} 
      />
    );
    
    const button = screen.getByText('Roll Dice');
    fireEvent.click(button);
    
    expect(onRollDice).toHaveBeenCalledTimes(1);
  });
});
```

**Running Frontend Tests:**
```bash
cd packages/frontend
npm test
```

## Integration Testing

Integration tests verify that different parts of the system work together.

### API Integration Tests

**Example: Testing API Endpoints**

```typescript
// packages/backend/tests/api.test.ts
import request from 'supertest';
import { app } from '../src/index';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /api/rooms', () => {
    it('should create a new room', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({
          playerName: 'Alex',
          maxPlayers: 6,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('roomId');
      expect(response.body).toHaveProperty('roomCode');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({
          playerName: '',  // Invalid: empty name
        });

      expect(response.status).toBe(400);
    });
  });
});
```

### Socket.IO Integration Tests

**Example: Testing WebSocket Events**

```typescript
// packages/backend/tests/socket.test.ts
import { io as Client } from 'socket.io-client';
import { createServer } from '../src/index';

describe('Socket.IO Events', () => {
  let clientSocket: any;
  let serverSocket: any;

  beforeAll((done) => {
    const server = createServer();
    clientSocket = Client(`http://localhost:3001`);
    
    clientSocket.on('connect', done);
  });

  afterAll(() => {
    clientSocket.close();
  });

  it('should emit room_updated when room is created', (done) => {
    clientSocket.emit('create_room', {
      playerName: 'Alex',
      maxPlayers: 6,
    });

    clientSocket.on('room_updated', (data: any) => {
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('code');
      expect(data.players).toHaveLength(1);
      done();
    });
  });
});
```

## End-to-End Testing

E2E tests simulate real user interactions.

### Playwright E2E Tests (Planned)

```typescript
// e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete game flow', async ({ page, context }) => {
  // Player 1 creates a room
  await page.goto('http://localhost:3000/player');
  await page.fill('[placeholder="Enter your name"]', 'Player 1');
  await page.click('text=Create Game');
  
  const roomCode = await page.locator('.room-code').textContent();
  
  // Player 2 joins the room
  const page2 = await context.newPage();
  await page2.goto('http://localhost:3000/player');
  await page2.fill('[placeholder="Enter your name"]', 'Player 2');
  await page2.fill('[placeholder="ABC123"]', roomCode);
  await page2.click('text=Join Game');
  
  // Player 1 starts the game
  await page.click('text=Start Game');
  
  // Player 1 rolls dice
  await page.click('text=Roll Dice');
  await expect(page.locator('.dice-result')).toBeVisible();
});
```

**Running E2E Tests:**
```bash
npx playwright test
```

## Test Coverage

### Viewing Coverage Reports

```bash
# Generate coverage
npm test -- --coverage

# Open HTML report
# Backend
open packages/backend/coverage/lcov-report/index.html

# Frontend
open packages/frontend/coverage/lcov-report/index.html
```

### Coverage Goals

Target coverage levels:
- **Overall**: >80%
- **Critical Paths**: >90%
- **Utilities**: >85%
- **UI Components**: >70%

### Checking Coverage

```bash
# View summary in terminal
npm test -- --coverage --coverageReporters=text-summary

# Fail if coverage is below threshold
npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

## Writing Good Tests

### Best Practices

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good: Test what the user sees
   expect(screen.getByText('Roll Dice')).toBeInTheDocument();
   
   // Bad: Test implementation details
   expect(component.state.showButton).toBe(true);
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should show error message when room code is invalid', () => {});
   
   // Bad
   it('test room code', () => {});
   ```

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should calculate new position correctly', () => {
     // Arrange
     const currentPosition = 5;
     const diceRoll = 3;
     
     // Act
     const result = calculateNewPosition(currentPosition, diceRoll);
     
     // Assert
     expect(result).toBe(8);
   });
   ```

4. **Test Edge Cases**
   ```typescript
   it('should handle empty player list', () => {});
   it('should handle maximum players', () => {});
   it('should handle invalid dice roll values', () => {});
   ```

5. **Keep Tests Isolated**
   ```typescript
   beforeEach(() => {
     // Reset state before each test
     jest.clearAllMocks();
   });
   ```

6. **Mock External Dependencies**
   ```typescript
   jest.mock('../services/database', () => ({
     getPlayer: jest.fn(() => Promise.resolve(mockPlayer)),
   }));
   ```

### Test Organization

```typescript
describe('GameService', () => {
  describe('rollDice', () => {
    it('should return valid dice value', () => {});
    it('should be random', () => {});
  });

  describe('movePlayer', () => {
    it('should update player position', () => {});
    it('should handle board wrap-around', () => {});
    it('should emit player_moved event', () => {});
  });
});
```

### Common Testing Utilities

**Mock Data:**
```typescript
// tests/mocks/player.ts
export const mockPlayer = {
  id: '1',
  name: 'Test Player',
  position: 0,
  turnOrder: 0,
  isHost: true,
};

export const mockRoom = {
  id: 'room-1',
  code: 'ABC123',
  hostId: '1',
  status: 'waiting',
  maxPlayers: 10,
  currentTurn: 0,
  players: [mockPlayer],
};
```

**Test Helpers:**
```typescript
// tests/helpers/render.tsx
import { render } from '@testing-library/react';
import { SocketProvider } from '@/lib/SocketProvider';

export function renderWithProviders(component: React.ReactElement) {
  return render(
    <SocketProvider>{component}</SocketProvider>
  );
}
```

## Continuous Integration

Tests run automatically in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --ci --coverage
      - run: npm run lint
```

## Debugging Tests

### Run Specific Test in Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand test-file.test.ts
```

Then attach Chrome DevTools debugger.

### VS Code Debug Configuration

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## Related Documentation

- [Build and Run](./Build-and-Run.md) - Development guide
- [Contributing](./Contributing.md) - Contribution guidelines
- [API Reference](./API-Reference.md) - API documentation

---

**Last updated:** 17-11-2025
