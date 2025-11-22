# Routine Guide

> **Production-grade Personal Daily Routine Tracker**  
> Backend API built with NestJS, Prisma, PostgreSQL (Supabase-ready)

[![CI](https://github.com/yourusername/routine-guide/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/routine-guide/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-brightgreen.svg)](https://www.prisma.io/)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - JWT-based auth with refresh tokens
- 📅 **Routine Management** - Daily/weekly habit tracking
- ✔️ **Check-ins** - Mark routines as done/skipped
- 🔥 **Streak Tracking** - Automatic streak calculation (current + best)
- 📊 **Analytics** - Completion rates, statistics, insights
- 📝 **Event Logging** - Telemetry for all user actions
- ⏰ **Scheduler** - Background worker for daily check-in generation
- 🔔 **Push Notifications** - FCM integration (placeholder)

### Technical Features
- 🏗️ **Clean Architecture** - Controller → Service → Repository pattern
- 🔐 **Security** - RLS (Row Level Security), rate limiting, CORS, input validation
- 📚 **OpenAPI/Swagger** - Auto-generated API documentation
- ✅ **Testing** - Unit + E2E tests with Jest/Supertest
- 🚀 **CI/CD** - GitHub Actions for lint, test, build
- 🐳 **Docker** - docker-compose for local development
- 📦 **Monorepo** - npm workspaces (api + workers + sdk)

## 🏛️ Architecture

```
apps/
  api/                      # Main NestJS API server
    src/
      common/               # Guards, filters, interceptors, decorators
      config/               # Environment validation (Zod)
      modules/
        auth/               # Authentication (signup, login, refresh)
        routines/           # Routine CRUD
        checkins/           # Check-in management
        streaks/            # Streak domain logic
        events/             # Event telemetry
        analytics/          # Aggregated insights
      main.ts               # Application entry point
      app.module.ts         # Root module
    prisma/
      schema.prisma         # Database schema
      seed.ts               # Seed script
    test/                   # E2E tests
  workers/
    src/
      index.ts              # Cron scheduler for daily tasks
packages/
  sdk/                      # (Future) API client SDK
.github/
  workflows/
    ci.yml                  # CI pipeline
```

### Design Principles

**SOLID** - Single responsibility, dependency injection  
**DRY** - Reusable services, shared interfaces  
**KISS** - Simple, focused functions  
**Clean Architecture** - Separation of concerns (controllers, services, repositories)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | NestJS 10 |
| Language | TypeScript 5.3 |
| Database | PostgreSQL 16 (Supabase-ready) |
| ORM | Prisma 5.7 |
| Authentication | JWT (jsonwebtoken) |
| Validation | Zod + class-validator |
| Testing | Jest + Supertest |
| API Docs | Swagger/OpenAPI |
| Scheduler | node-cron |
| Push | FCM (Firebase Cloud Messaging) |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 14 (or Supabase account)
- npm >= 9

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/routine-guide.git
cd routine-guide

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`  
Swagger docs at `http://localhost:3000/api/docs`

### Using Docker

```bash
# Start PostgreSQL + API
docker-compose up -d

# Check logs
docker-compose logs -f api

# Stop
docker-compose down
```

## 🔧 Environment Variables

See `.env.example` for all variables. Key ones:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/routine_guide

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-secret-key-min-32-chars

# App
API_PORT=3000
NODE_ENV=development
TIMEZONE=Europe/Istanbul

# Scheduler
CRON_ENABLED=true
CRON_TIMEZONE=Europe/Istanbul

# FCM (optional)
FCM_SERVER_KEY=your-fcm-key
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

All endpoints (except `/auth/*`) require Bearer token:

```http
Authorization: Bearer <access_token>
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** |||
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh access token |
| **Routines** |||
| GET | `/routines` | Get all user routines |
| POST | `/routines` | Create routine |
| GET | `/routines/:id` | Get routine by ID |
| PATCH | `/routines/:id` | Update routine |
| DELETE | `/routines/:id` | Delete routine |
| **Check-ins** |||
| GET | `/checkins` | Get check-ins (with date filters) |
| GET | `/checkins/routines/:id` | Get check-ins for routine |
| POST | `/checkins` | Create check-in |
| PATCH | `/checkins/:id/done` | Mark as done (updates streak) |
| DELETE | `/checkins/:id` | Delete check-in |
| **Streaks** |||
| GET | `/streaks` | Get all user streaks |
| GET | `/streaks/routines/:id` | Get streak for routine |
| **Analytics** |||
| GET | `/analytics/summary` | Get summary (completion rate, top streaks) |
| **Events** |||
| GET | `/events` | Get user events |
| POST | `/events` | Create event (manual) |

### Example Requests

**Create Daily Routine:**
```bash
curl -X POST http://localhost:3000/routines \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Run",
    "frequency": "daily",
    "timeOfDay": "07:00:00",
    "reminders": true,
    "meta": { "distance": 5 }
  }'
```

**Mark Check-in as Done:**
```bash
curl -X PATCH http://localhost:3000/checkins/abc-123/done \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Great run today!"
  }'
```

**Get Analytics:**
```bash
curl http://localhost:3000/analytics/summary?from=2025-11-01&to=2025-11-30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🗄️ Database Schema

Key tables:

- `routines` - Habit definitions (daily/weekly schedule)
- `checkins` - Daily check-in records (done/skipped)
- `streaks` - Streak tracking per routine
- `events` - Telemetry/event logs
- `user_prefs` - User preferences (timezone, locale)
- `reminders` - Push notification scheduling
- `push_tokens` - FCM device tokens
- `api_sources` - API integration definitions
- `api_ingest` - External API data ingestion

See `apps/api/prisma/schema.prisma` for full schema.

### RLS (Row Level Security)

All tables have RLS policies:
```sql
auth.uid() = user_id  -- Users can only access their own data
```

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e
```

### Test Structure

- `*.spec.ts` - Unit tests (e.g., `streaks.service.spec.ts`)
- `*.e2e-spec.ts` - Integration tests (e.g., `auth.e2e-spec.ts`)

### Key Test Cases

✅ Streak increment on consecutive day  
✅ Streak reset on gap  
✅ Best streak update  
✅ Auth flow (signup → login → refresh)  
✅ Routine CRUD operations  
✅ Check-in creation and marking as done  

## 🚢 Deployment

### Environment Setup

1. **Database**: Provision PostgreSQL (Supabase recommended)
2. **Environment**: Set all required env variables
3. **Migrations**: Run `npm run db:migrate`
4. **Build**: `npm run build`
5. **Start**: `npm run start:prod`

### Production Checklist

- [ ] Use strong JWT secrets (min 32 chars)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set rate limits
- [ ] Monitor logs (e.g., Datadog, Sentry)
- [ ] Set up database backups
- [ ] Configure FCM for push notifications
- [ ] Run migrations before deploy
- [ ] Set `NODE_ENV=production`

### Docker Deployment

```bash
# Build image
docker build -t routine-guide-api -f apps/api/Dockerfile .

# Run
docker run -p 3000:3000 --env-file .env routine-guide-api
```

### Vercel/Railway/Render

All support Node.js apps. Set env variables in dashboard and deploy from GitHub.

## 👨‍💻 Development

### Project Structure

```
routine-guide/
├── apps/
│   ├── api/              # NestJS API
│   └── workers/          # Cron scheduler
├── packages/
│   └── sdk/              # (Future) Client SDK
├── .github/workflows/    # CI/CD
├── .env.example
├── docker-compose.yml
└── package.json          # Workspace root
```

### Available Scripts

```bash
# Development
npm run start:dev         # Start API in watch mode
npm run worker:scheduler  # Start cron worker

# Database
npm run db:generate       # Generate Prisma client
npm run db:migrate        # Run migrations
npm run db:migrate:dev    # Create migration
npm run db:seed           # Seed database
npm run db:studio         # Open Prisma Studio

# Code Quality
npm run lint              # Lint code
npm run format            # Format with Prettier

# Testing
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report

# Build
npm run build             # Build all workspaces
npm run start:prod        # Start production server
```

### Adding a New Module

1. Generate module: `nest g module modules/your-module`
2. Generate service: `nest g service modules/your-module`
3. Generate controller: `nest g controller modules/your-module`
4. Add Prisma model to `schema.prisma`
5. Create DTO in `dto/` folder
6. Add module to `app.module.ts`
7. Write tests

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add journals module
fix: correct streak calculation
chore: update dependencies
docs: improve README
test: add checkins e2e tests
```

## 📝 Roadmap

- [ ] Journals module (daily reflections)
- [ ] Tasks module (todo items)
- [ ] Attachments (images for journal/routines)
- [ ] Public sharing links
- [ ] Frontend app (React Native / Next.js)
- [ ] Real-time notifications (WebSockets)
- [ ] Social features (friends, challenges)
- [ ] Monthly partitioning for large tables

## 📄 License

MIT

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Supabase](https://supabase.com/) - Open-source Firebase alternative

---

**Built with ❤️ using Clean Architecture and SOLID principles**

For questions or issues, please [open an issue](https://github.com/yourusername/routine-guide/issues).
