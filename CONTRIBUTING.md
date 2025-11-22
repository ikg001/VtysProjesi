# Contributing to Routine Guide

Thank you for your interest in contributing! 🎉

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/routine-guide.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/my-feature`
5. Make your changes
6. Run tests: `npm run test`
7. Commit: `git commit -m "feat: add my feature"`
8. Push: `git push origin feature/my-feature`
9. Open a Pull Request

## Code Style

- Follow existing code style
- Use TypeScript strict mode
- Write JSDoc comments for public APIs
- Follow SOLID principles
- Keep controllers thin, logic in services

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
chore: update dependencies
refactor: refactor code
style: format code
perf: improve performance
```

## Testing

- Write unit tests for services
- Write E2E tests for critical flows
- Aim for >80% coverage

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage report
```

## Pull Request Guidelines

- Keep PRs focused and small
- Update documentation if needed
- Add tests for new features
- Ensure all tests pass
- Update CHANGELOG.md

## Questions?

Open an issue or reach out to maintainers.

Thank you! 🙏
