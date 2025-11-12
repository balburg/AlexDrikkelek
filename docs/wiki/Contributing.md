# Contributing to AlexDrikkelek

Thank you for your interest in contributing to AlexDrikkelek! We welcome contributions from the community.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Messages](#commit-messages)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment:

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome newcomers and help them get started
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Collaborative**: Work together towards common goals
- **Be Empathetic**: Show empathy towards other community members

## How to Contribute

There are many ways to contribute to AlexDrikkelek:

### Reporting Bugs

Found a bug? Please help us fix it:

1. **Check Existing Issues**: Search [GitHub Issues](https://github.com/balburg/AlexDrikkelek/issues) to see if it's already reported
2. **Create a New Issue**: If not found, create a detailed bug report including:
   - Clear, descriptive title
   - Detailed description of the issue
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details:
     - OS (Windows/Mac/Linux)
     - Browser and version
     - Node.js version
     - npm version

**Bug Report Template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened

**Screenshots:**
If applicable, add screenshots

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.17.0]
```

### Suggesting Features

Have an idea for a new feature?

1. **Check Existing Requests**: Look through [GitHub Issues](https://github.com/balburg/AlexDrikkelek/issues?q=is%3Aissue+label%3Aenhancement)
2. **Create a Feature Request**: Provide:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Mockups or examples (if applicable)

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or clarify unclear sections
- Add missing information
- Create tutorials or guides
- Improve code examples
- Add diagrams or screenshots

### Writing Code

Ready to write code? Great!

1. **Find an Issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Claim It**: Comment on the issue to let others know you're working on it
3. **Fork and Branch**: Create your development branch
4. **Code**: Implement your changes following our coding standards
5. **Test**: Write tests and ensure all tests pass
6. **Submit**: Create a pull request

## Development Workflow

### Initial Setup

1. **Fork the Repository**
   - Click "Fork" on GitHub
   - Clone your fork locally:
     ```bash
     git clone https://github.com/YOUR-USERNAME/AlexDrikkelek.git
     cd AlexDrikkelek
     ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/balburg/AlexDrikkelek.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp packages/frontend/.env.example packages/frontend/.env.local
   cp packages/backend/.env.example packages/backend/.env
   ```

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

   Branch naming conventions:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation updates
   - `refactor/` - Code refactoring
   - `test/` - Test improvements

2. **Make Your Changes**
   - Follow coding standards (see below)
   - Write clean, maintainable code
   - Add comments for complex logic

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   See [Commit Messages](#commit-messages) section below.

5. **Keep Your Branch Updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to GitHub and create a PR from your branch
   - Fill out the PR template
   - Link related issues

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define Proper Types**: Avoid `any` when possible
- **Use Interfaces**: For object shapes and contracts
- **Export Types**: Make types reusable across modules

**Good:**
```typescript
interface Player {
  id: string;
  name: string;
  position: number;
}

function movePlayer(player: Player, steps: number): Player {
  return { ...player, position: player.position + steps };
}
```

**Bad:**
```typescript
function movePlayer(player: any, steps: any) {
  player.position = player.position + steps;
  return player;
}
```

### React/Next.js

- **Functional Components**: Use hooks instead of class components
- **Component Size**: Keep components small and focused (< 200 lines)
- **Prop Types**: Always type your props
- **Hooks Rules**: Follow React hooks rules

**Good:**
```typescript
interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
  onRollDice: () => void;
}

export default function PlayerCard({ player, isCurrentTurn, onRollDice }: PlayerCardProps) {
  return (
    <div className="player-card">
      <h3>{player.name}</h3>
      {isCurrentTurn && <button onClick={onRollDice}>Roll Dice</button>}
    </div>
  );
}
```

### Node.js/Fastify

- **Async/Await**: Use for asynchronous operations
- **Error Handling**: Always handle errors properly
- **Logging**: Add appropriate logging
- **Validation**: Validate all inputs

**Good:**
```typescript
async function createRoom(playerName: string, maxPlayers: number): Promise<GameRoom> {
  try {
    logger.info('Creating room', { playerName, maxPlayers });
    
    const room = await roomService.create({ playerName, maxPlayers });
    
    logger.info('Room created', { roomId: room.id });
    return room;
  } catch (error) {
    logger.error('Failed to create room', { error, playerName });
    throw error;
  }
}
```

### General Guidelines

- **Clear Variable Names**: Use descriptive names
  - Good: `currentPlayerIndex`, `diceRoll`
  - Bad: `i`, `x`, `temp`

- **Small Functions**: Keep functions focused on one task
  - Aim for < 20 lines per function
  - Extract complex logic into separate functions

- **Comments**: Add comments for complex logic
  ```typescript
  // Calculate new position with wrap-around for board size
  const newPosition = (currentPosition + diceRoll) % boardSize;
  ```

- **No Console Logs**: Use proper logging
  ```typescript
  // Bad
  console.log('Player moved');
  
  // Good
  logger.info('Player moved', { playerId, newPosition });
  ```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting (no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```
feat(player): add avatar upload functionality

fix(game): resolve dice roll synchronization issue

docs(readme): update installation instructions

test(backend): add unit tests for game service

chore(deps): update dependencies to latest versions
```

### Guidelines

- Use imperative mood: "add" not "added"
- Don't capitalize first letter
- No period at the end
- Keep subject line under 50 characters
- Add body for complex changes (optional)

## Pull Request Process

### Before Submitting

1. ✅ **All tests pass**: `npm test`
2. ✅ **Code is linted**: `npm run lint`
3. ✅ **Build succeeds**: `npm run build`
4. ✅ **Branch is up-to-date**: Rebased with main
5. ✅ **Commits are clean**: Meaningful commit messages

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe the tests you ran

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my own code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, PR will be merged
5. **Cleanup**: Delete your feature branch after merge

## Testing

### Writing Tests

**Backend Tests (Jest):**
```typescript
describe('GameService', () => {
  describe('rollDice', () => {
    it('should return a number between 1 and 6', () => {
      const result = GameService.rollDice();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });
  });
});
```

**Frontend Tests (React Testing Library):**
```typescript
describe('PlayerCard', () => {
  it('shows roll button when it is current turn', () => {
    render(<PlayerCard player={mockPlayer} isCurrentTurn={true} />);
    expect(screen.getByText('Roll Dice')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- PlayerCard.test.tsx
```

### Test Coverage

- Aim for >80% coverage
- Focus on critical paths
- Test edge cases
- Test error handling

## Documentation

### Code Documentation

Add JSDoc comments for public APIs:

```typescript
/**
 * Rolls a six-sided dice and returns the result
 * @returns A random number between 1 and 6
 */
function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}
```

### README Updates

Update README.md when:
- Adding user-facing features
- Changing setup steps
- Adding new prerequisites
- Updating scripts or commands

### API Documentation

Update `docs/API.md` when:
- Adding new endpoints
- Changing request/response formats
- Adding WebSocket events
- Modifying data types

## Questions or Need Help?

- **GitHub Discussions**: Ask questions or start discussions
- **GitHub Issues**: Report bugs or request features
- **Pull Request Comments**: Ask for clarification on reviews
- **Email Maintainers**: For private concerns

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md file
- Credited in release notes
- Recognized in the community

Thank you for contributing to AlexDrikkelek! 🎉

---

**Last updated:** 12-11-2024
