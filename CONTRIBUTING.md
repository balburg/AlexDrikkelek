# Contributing to AlexDrikkelek

Thank you for your interest in contributing to AlexDrikkelek! This guide will help you get started.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies** in both frontend and backend
3. **Create a branch** for your feature/fix
4. **Make your changes** following our code style
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Environment Setup

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

### Quick Start

```bash
# Install all dependencies
npm install

# Start development servers (both frontend and backend)
npm run dev

# Or start individually
cd backend && npm run dev
cd frontend && npm run dev
```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Define proper types/interfaces
- Avoid `any` type

### Formatting
- Run ESLint before committing
- Follow the existing code style
- Use meaningful variable and function names

### Git Commits
- Use clear, descriptive commit messages
- Follow conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for maintenance

Example:
```
feat: add player authentication with Azure AD B2C
```

## Testing

(To be implemented)

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Run linting**: `npm run lint`
5. **Update the README** if adding new features
6. **Reference any related issues** in your PR description

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Linting passes

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## Project Structure

Please maintain the existing project structure:

```
AlexDrikkelek/
├── frontend/         # Next.js application
├── backend/          # Fastify API
├── infrastructure/   # Azure IaC
└── docs/            # Documentation
```

## Reporting Bugs

Bugs are tracked as GitHub issues. Create an issue and provide:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, etc.)

## Feature Requests

We love feature requests! Please provide:

- **Clear description** of the feature
- **Use case** - why is it needed?
- **Possible implementation** approach (optional)

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
