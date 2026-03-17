# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenIDEth is a blockchain-based rental platform connecting landlords and tenants. It's a pnpm monorepo managed by Turborepo with three main apps and two shared packages.

## Commands

```bash
# Install dependencies
pnpm install

# Development (all packages)
pnpm dev

# Build all packages (respects dependency order via turbo)
pnpm build

# Lint / Test / Clean (all packages)
pnpm lint
pnpm test
pnpm clean

# Format
pnpm format

# Database (runs in packages/database context)
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations (prisma migrate dev)
pnpm db:seed        # Seed database with sample data

# Run a single app
pnpm --filter api dev        # NestJS API on :4000
pnpm --filter web dev        # Next.js frontend on :3000

# Run a single package build
pnpm --filter @openideth/shared build
pnpm --filter @openideth/database build

# API tests
pnpm --filter api test                    # All tests
pnpm --filter api test -- --testPathPattern=auth  # Single test file

# Docker (full stack)
docker compose up              # Dev environment
docker compose -f docker-compose.yml -f docker-compose.prod.yml up  # Production
```

## Architecture

**Monorepo structure:**
- `apps/api` — NestJS backend (port 4000, prefix `/api/v1`)
- `apps/web` — Next.js frontend (port 3000) — *planned*
- `packages/shared` (`@openideth/shared`) — Zod schemas, TypeScript enums, constants shared between frontend and backend
- `packages/database` (`@openideth/database`) — Prisma schema, client singleton, seed script
- `packages/contracts` — Solidity smart contracts (Hardhat) — *planned*

**Backend (apps/api):**
- NestJS with global `api/v1` prefix, Swagger docs at `/api/docs`
- `PrismaModule` is global — inject `PrismaService` anywhere without importing the module
- Auth uses Passport JWT strategy; guards: `JwtAuthGuard`, `RolesGuard` with `@Roles()` decorator
- `@CurrentUser()` param decorator extracts user from JWT-authenticated request
- `HttpExceptionFilter` standardizes error responses; `TransformInterceptor` wraps success responses in `{ data, meta }`
- Feature modules: auth, users, properties, agreements, payments, escrow, notifications, kyc, reviews, admin, health
- Payments use Strategy pattern (`IPaymentStrategy`) for Stripe vs crypto
- BullMQ for background jobs (email, payment reminders), connected via Redis

**Shared package (packages/shared):**
- Enums mirror Prisma enums but are usable without Prisma client (e.g., `UserRole`, `PaymentStatus`)
- Zod schemas provide runtime validation; inferred types exported alongside (e.g., `registerSchema` / `RegisterInput`)
- Constants: `PLATFORM_FEE_BPS` (250 = 2.5%), `REWARD_AMOUNTS`, pagination defaults

**Database (packages/database):**
- PostgreSQL via Prisma ORM. Schema in `packages/database/prisma/schema.prisma`
- 12 models, all UUIDs, `@@map` to snake_case table names
- Singleton client in `src/client.ts` (prevents connection exhaustion in dev via `globalThis` caching)
- Ambiguous relations use named labels: `TenantAgreements`/`LandlordAgreements`, `PayerPayments`/`PayeePayments`, `KycReviewer`

**Infrastructure:**
- Docker Compose: postgres (16), redis (7), api, worker, web, hardhat (local blockchain on :8545), nginx (reverse proxy on :80)
- Nginx routes `/api` to API, `/` to web, with WebSocket upgrade support at `/socket.io`
- `.env.example` has all required environment variables

## Key Patterns

- Three user roles: `TENANT`, `LANDLORD`, `ADMIN` — role-based access via `@Roles('ADMIN')` + `RolesGuard`
- NestJS DTOs use `class-validator` decorators; shared package uses Zod — these are separate validation layers
- Turbo `build` task has `dependsOn: ["^build"]` — shared/database build before api/web
- API tsconfig uses `commonjs` module + `node` moduleResolution (NestJS requirement), while shared/database use `bundler` from base config

## Development Notes

- Node >= 20, pnpm >= 9 required
- Copy `.env.example` to `.env` before running
- Run `pnpm db:generate` after any Prisma schema change before building
- The project is under active development — see `TASKS.md` for the full 188-task implementation plan across 7 phases

## Project Info

- **Repository:** https://github.com/sefatuncer/openideth
- **Owner:** Sefa Tuncer (tuncersefa@gmail.com)
- **Branch strategy:** `main` branch, push via `git push origin main`
- **Commit format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`)
- **Git author:** Never add Co-Authored-By or any Claude attribution to commits

## Workflow Commands

Custom slash commands in `.claude/commands/` drive the development workflow:

| Command | Purpose |
|---------|---------|
| `/plan` | Pick next pending tasks from TASKS.md, research codebase, create implementation plan |
| `/work` | Execute the approved plan, implement tasks, mark them `[x]` in TASKS.md |
| `/review` | Multi-perspective code review of recent changes |
| `/compound` | Document learnings, update CLAUDE.md with patterns discovered |
| `/deploy` | Stage, commit, push changes to GitHub |
| `/lfg` | Run all 5 phases sequentially: plan → work → review → compound → deploy |

## Lessons Learned

_(Entries added by `/compound` after each development cycle)_
