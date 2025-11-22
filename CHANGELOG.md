# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with NestJS, Prisma, PostgreSQL
- Authentication module (signup, login, refresh)
- Routines module (CRUD for daily/weekly habits)
- Check-ins module (mark routines as done/skipped)
- Streaks module (automatic streak calculation)
- Events module (telemetry logging)
- Analytics module (completion rates, insights)
- Scheduler worker (daily check-in generation)
- OpenAPI/Swagger documentation
- Unit and E2E tests
- GitHub Actions CI pipeline
- Docker support
- Comprehensive README

### Security
- JWT authentication with refresh tokens
- Row Level Security (RLS) policies
- Rate limiting
- Input validation
- CORS configuration

## [1.0.0] - 2025-11-12

### Added
- 🎉 Initial release
- Production-ready backend API
- Clean architecture with SOLID principles
- Comprehensive test coverage
- CI/CD pipeline
- Docker deployment support

[Unreleased]: https://github.com/yourusername/routine-guide/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/routine-guide/releases/tag/v1.0.0
