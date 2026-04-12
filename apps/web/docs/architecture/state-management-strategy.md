# State Management Strategy (MVP)

## Purpose

Define a clear, team-wide approach for client-side state management in the web app.

This document answers:
- whether to use Zustand or Redux Toolkit by default
- how to split state across server and client boundaries in Next.js App Router
- when Redux Toolkit becomes justified later

## Decision

Use **Zustand as the default client state library** for MVP.

Do **not** adopt Redux Toolkit as the baseline right now.

## Why This Decision Fits This Codebase

### 1. Next.js App Router Is Server-First

Most durable application state should come from server routes, server actions, and database-backed APIs.
This reduces the need for a large, client-only global state graph.

Zustand aligns with this model by handling only the client-side state that remains:
- transient UI state
- user interaction flow state
- realtime in-memory projections

### 2. Realtime Requirements Favor Lightweight Client Stores

The platform has realtime booking, notifications, and operational updates. These are event-heavy and often ephemeral.

Zustand gives simple local stores and selective subscriptions that map naturally to event-driven UI updates without reducer/action boilerplate.

### 3. Team Speed and Lower Cognitive Overhead

For MVP, development velocity matters. Zustand requires fewer concepts to teach and maintain:
- no mandatory slice/action/reducer ceremony
- no dispatch plumbing for straightforward updates
- easy co-location of store logic near feature code

### 4. Better Fit for Feature-Scoped Ownership

Current project layout is feature-oriented. Zustand works well with many small stores per domain (booking, helper dashboard, notifications), avoiding a monolithic global store.

### 5. Lower Migration Risk

If complexity later justifies Redux Toolkit, feature stores can be migrated incrementally.
Starting with Redux Toolkit now introduces upfront complexity before strong evidence of need.

## What Goes Where (State Ownership Model)

### Server State (Authoritative)

Keep in server routes/actions and fetch via HTTP APIs:
- bookings, payments, disputes, reviews, verification records
- identity, authorization, organization membership
- analytics and historical aggregates

Recommended handling:
- fetch on server where possible
- cache/revalidate with Next.js primitives and route-level strategy
- never treat client store as source of truth for these entities

### Client State (Zustand)

Store only data that is primarily interaction-driven:
- active filters/sort/view mode
- modal/drawer/wizard state
- optimistic interaction flags
- socket connection status
- active-screen realtime projections (for example, current booking timeline card)

### URL State

State that should survive refresh/share belongs in search params/path:
- selected tabs
- filter presets
- pagination cursor/page

## Decision Matrix

| Situation | Use Zustand | Use Redux Toolkit |
|---|---|---|
| UI/transient state across components | Yes | No |
| Feature-scoped client state | Yes | No |
| Realtime event projection in active views | Yes | No |
| Large normalized entity graph with complex cross-entity reducers | Maybe | Yes |
| Strong need for strict action audit workflow/time travel across many contributors | Maybe | Yes |
| RTK Query as mandatory unified data layer everywhere | Maybe | Yes |

## Practical Rules for MVP

1. Prefer many small Zustand stores over one giant store.
2. Keep each store feature-scoped and colocated with its domain.
3. Avoid persisting sensitive or authoritative business data in browser storage.
4. Use selectors and shallow comparison to minimize re-renders.
5. Invalidate/refetch authoritative data after critical mutations.
6. Treat websocket events as hints, then reconcile with HTTP snapshots on reconnect.

## Suggested Store Topology

Suggested locations under `apps/web/src`:

- `features/booking/state/booking-ui.store.ts`
- `features/booking/state/active-booking-realtime.store.ts`
- `features/helper/state/incoming-jobs.store.ts`
- `features/admin/state/live-ops.store.ts`
- `features/notifications/state/notifications-ui.store.ts`

Keep each store focused:
- `state`: minimal current shape
- `actions`: pure update methods
- `derived`: computed selectors near consuming components

## Realtime Handling Pattern

1. Mutation command goes through HTTP endpoint.
2. Server commits DB transaction.
3. Server emits websocket event.
4. Client store applies idempotent patch for immediate UX.
5. Client periodically or conditionally reconciles from HTTP snapshot.

This preserves correctness while keeping the UI responsive.

## Anti-Patterns to Avoid

1. Using client store as the source of truth for payments/disputes.
2. One global mega-store shared by every feature.
3. Writing websocket payloads directly into deep global entities without version checks.
4. Over-persisting data to localStorage/sessionStorage.
5. Coupling all component state to a centralized reducer when local component state is enough.

## When to Reconsider Redux Toolkit

Re-evaluate if 2 or more of these become true:

1. Multiple teams are editing the same global state graph and need strict conventions.
2. State transitions require extensive reducer middleware workflows.
3. Entity normalization and cross-slice transactions become hard to reason about.
4. You decide to standardize all remote data access on RTK Query.

If triggered, migrate selectively by domain instead of a full rewrite.

## Implementation Checklist

- [ ] Add Zustand package to web app dependencies.
- [ ] Create first feature store for booking UI state.
- [ ] Create realtime projection store for active booking timeline.
- [ ] Add reconnect + HTTP reconciliation logic for websocket screens.
- [ ] Add store usage conventions to team docs/code review checklist.
- [ ] Revisit decision after MVP usage data (4-6 weeks).

## Final Recommendation

For this helper-platform MVP, **Zustand is the right default** because it matches server-first architecture, realtime UX needs, and team velocity goals with lower complexity.

Choose Redux Toolkit only when evidence shows you need stronger global state governance than MVP currently requires.