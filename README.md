# Helper Platform Monorepo

This Turborepo is organized into two runtime apps:

- `apps/web`: Next.js application (customer/helper/admin product surfaces)
- `apps/realtime`: Realtime WebSocket service (event transport for live booking updates)

## Workspace Packages

- `@repo/ui`: Shared UI components
- `@repo/eslint-config`: Shared ESLint setup
- `@repo/typescript-config`: Shared TypeScript setup

## Quick Start

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs all `dev` scripts through Turborepo:

- Web app: `http://localhost:3000`
- Realtime service health: `http://localhost:4001`
- Realtime websocket endpoint: `ws://localhost:4001/ws`

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

Run only the web app:

```bash
pnpm turbo dev --filter=web
```

Run only the realtime service:

```bash
pnpm turbo dev --filter=realtime
```

## Notes

- `turbo.json` caches both Next.js outputs (`.next/`) and service outputs (`dist/`).
- The realtime service currently broadcasts incoming websocket messages to all connected clients.
