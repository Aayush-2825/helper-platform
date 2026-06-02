# Architecture Overview

This document summarizes the architecture of the Helper Platform monorepo.

## Purpose

Helper Platform is an on-demand marketplace connecting customers with helpers, supporting booking lifecycle, matching, realtime updates, payments, KYC video verification, reviews, disputes and admin analytics.

## High-level components

- Web (frontend): `apps/web` — Next.js 16 (React 19) application implementing customer, helper and admin portals. Server-side API routes live under `src/app/api`.
- Realtime service: `apps/realtime` — Express + `ws` WebSocket server for persistent realtime connections, background jobs and event persistence.
- Shared packages: `packages/db` (Drizzle ORM schema and migrations), `packages/ui` (shared React components), `packages/types` and `packages/validators`.
- Data store: PostgreSQL via Drizzle ORM. Redis available for caching/pubsub (env-driven) and recommended for horizontal WS scaling.

## Key responsibilities

- `apps/web`: web UI, server-side API endpoints, auth integration (`better-auth`), payments integration (Razorpay), file upload signing (Cloudinary), KYC scheduling (Google Calendar service account).
- `apps/realtime`: maintains WS connections, authenticates sockets, persists outbound events for offline delivery (`notificationQueue`, `bookingEvents`) and exposes a secure broadcast endpoint.
- `packages/db`: single source of truth for DB schema, migrations, and typed access across apps.

## Authentication

- `better-auth` with Drizzle adapter: provides email/password, email verification, Google OAuth, two-factor plugin and organizations/teams support.
- Sessions use cookie JWE encryption and are configured to refresh based on `session.updateAge` and `session.expiresIn`.

## Realtime design

- In-memory `WsDispatcher` groups sockets by userId and supports send/multicast/broadcast.
- `broadcastEvent()` persists notifications and booking events, then dispatches to currently connected sockets.
- Offline delivery: queued notifications replayed on reconnect via `flushQueuedNotificationsForUser()`.

## Data flow

1. Client action → Next.js API route or direct client request.
2. API writes state to Postgres via Drizzle.
3. If realtime update needed, controller calls `broadcastEvent()` in realtime service.
4. `broadcastEvent()` persists and then uses the dispatcher to deliver to sockets; offline users receive queued notifications on reconnection.

## Scalability considerations

- The current dispatcher is process-bound; horizontal scaling requires adding a cross-instance pub/sub (Redis, NATS, etc.) for socket routing.
- Consider decoupling persistence and delivery using an asynchronous queue for high throughput.

## Where to look in the repo

- Web app: `apps/web` — Next.js source and API routes.
- Realtime: `apps/realtime/src/ws`, `apps/realtime/src/routes`, and `apps/realtime/src/services`.
- DB schema & migrations: `packages/db` and `packages/db/drizzle.*.config.ts`.
