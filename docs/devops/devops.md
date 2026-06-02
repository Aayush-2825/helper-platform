# DevOps & Deployment

This document provides developer and operator guidance for running the platform locally and in production.

## Local development

Prerequisites: Node 18+, pnpm 9+, PostgreSQL, Redis.

Quick start:

```bash
pnpm install
pnpm dev
```

Common per-app runs:

```bash
# Run web app
pnpm turbo dev --filter=web

# Run realtime service
pnpm turbo dev --filter=realtime
```

## Database migrations & Drizzle

- Drizzle configs are in `packages/db/drizzle.*.config.ts`.
- Generate/migrate/push via workspace scripts, e.g.:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
```

## Environment variables

- See `.env.example` for required variables. Ensure production secrets are stored in a secret manager.

## Realtime service hosting

- The realtime service requires a persistent process supporting TCP/WebSocket connections. Recommended hosting options:
  - Docker container on a VM or container service (AWS ECS/Fargate, Azure Container Instances, GCP Cloud Run with long-lived connections caveat), Fly.io, Render, or a dedicated server.
  - Provision Redis for cross-instance pub/sub if running more than one realtime instance.

## Production considerations

- Run DB migrations before deploy. Use `drizzle-kit` CI steps to validate schema.
- Configure health checks: web uses standard Next endpoints; realtime exposes `/health`.
- Autoscale web via platform (Vercel). Autoscale realtime carefully and ensure sticky or distributed socket routing.

## Observability & backups

- Logging: `winston` is in use; centralize logs to a provider.
- Metrics & tracing: add Prometheus and traces (OpenTelemetry) for request/DB latency.
- Backups: schedule regular Postgres backups and test restores.

## CI/CD recommendations

- Use `pnpm`, `turbo` caching and `tsc` type checks in CI.
- Validate `drizzle-kit generate` and `drizzle-kit migrate --dry-run` in PR pipelines.

## Runbook highlights

- To recover realtime after instance failure: ensure broadcast messages are replayed from DB; consider implementing message replay with reliable queue.
- For payment issues: verify webhook signatures (`RAZORPAY_WEBHOOK_SECRET`) and reconcile payments against provider ledger.
