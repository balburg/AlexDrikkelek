# Contributing to AlexDrikkelek

Thank you for your interest in contributing to AlexDrikkelek! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check if the feature has been suggested in Issues
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes following our coding standards

4. Write or update tests as needed

5. Ensure all tests pass:
   ```bash
   npm test
   ```

6. Ensure code passes linting:
   ```bash
   npm run lint
   ```

7. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```

8. Push to your fork and submit a pull request

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any` when possible)
- Use interfaces for object shapes
- Export types that may be reused

### React/Next.js

- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing
- Follow React best practices

### Node.js/Fastify

- Use async/await for asynchronous operations
- Handle errors properly
- Add proper logging
- Follow REST API best practices

### General

- Write clear, self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add player avatar upload
fix: resolve dice roll synchronization issue
docs: update installation instructions
```

## Development Workflow

1. **Setup**: Follow README installation instructions
2. **Branch**: Create feature branch from `develop`
3. **Develop**: Make changes following coding standards
4. **Test**: Write and run tests
5. **Lint**: Ensure code passes linting
6. **Commit**: Use conventional commit messages
7. **Push**: Push to your fork
8. **PR**: Create pull request to `develop` branch

## Testing

- Write unit tests for new features
- Update existing tests when modifying code
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Documentation

- Update README if adding user-facing features
- Add JSDoc comments for complex functions
- Update API documentation for endpoint changes
- Include code examples where helpful

## Questions?

Feel free to:
- Open a discussion on GitHub
- Ask in pull request comments
- Reach out to maintainers

Thank you for contributing! 🎉
