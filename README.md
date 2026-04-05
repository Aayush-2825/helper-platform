# Helper Platform

Production-oriented monorepo for an on-demand helper marketplace with three role surfaces: customer, helper, and admin.

## MVP Status

Current status: MVP feature-complete for core booking, matching, realtime updates, payments, payouts tracking, verification, reviews, and disputes.

Main launch blockers remaining are operational hardening items:

- Full cross-journey integration coverage
- End-to-end observability consistency (logs and error tracking)
- Retry/fallback orchestration for external payment and notification failures

## Monorepo Layout

- apps/web: Next.js app (customer, helper, admin portals)
- apps/realtime: WebSocket + Express realtime service
- packages/db: Shared Drizzle schema, migrations, and DB scripts
- packages/ui: Shared UI components
- packages/eslint-config: Shared lint rules
- packages/typescript-config: Shared TS config

## Quick Start

Requirements:

- Node.js 18+
- pnpm 9+
- PostgreSQL
- Redis

Install and run:

```bash
pnpm install
pnpm dev
```

Default local endpoints:

- Web app: http://localhost:3000
- Realtime health: http://localhost:4001
- Realtime WS endpoint: ws://localhost:4001/ws

## Environment Setup

Create root .env with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/helper
DATABASE_URL_WEB=postgresql://user:password@localhost:5432/helper_web
DATABASE_URL_REALTIME=postgresql://user:password@localhost:5432/helper_realtime
REDIS_URL=redis://localhost:6379
```

You can use only DATABASE_URL for local development if both schemas share one database.

## Common Commands

Workspace:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

Run one app:

```bash
pnpm turbo dev --filter=web
pnpm turbo dev --filter=realtime
```

Database:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:sync:realtime
pnpm db:verify:realtime
```

## MVP Final Check List

Functional readiness:

- Booking lifecycle APIs implemented
- Matching and candidate flow implemented
- Helper accept/reject/start/complete flow implemented
- Realtime booking updates implemented
- Payments, webhook verification, and receipts implemented
- Payout request and admin payout state handling implemented
- Reviews and disputes implemented
- Helper onboarding and verification queue implemented
- Admin analytics endpoint and dashboard implemented

Engineering readiness:

- Monorepo build pipeline configured with Turbo
- TypeScript strict checks enabled across apps/packages
- Shared DB schema package integrated
- Unit and route-level tests present in web and realtime apps

Open hardening work before broad launch:

- Expand integration test coverage for full role journeys
- Complete standardized validation/error contracts on all write endpoints
- Complete centralized error tracking rollout
- Finalize retry strategy for payment and notification edge failures

## Deployment Notes

- Web and realtime services can be deployed independently.
- Run database migrations before deploying services.
- Run db:verify:realtime after schema repair operations.
- Keep secrets in environment-based secret managers only.

## License

Private project.
