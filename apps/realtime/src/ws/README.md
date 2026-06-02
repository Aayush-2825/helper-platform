# WebSocket Broadcast Layer

This folder exposes a small, testable broadcast layer used by realtime services.

Key pieces
- `dispatcher` (`dispatcher.ts`): in-process singleton that tracks WebSocket clients by userId and sends messages to sockets.
- `dispatch` (`dispatch.ts`): higher-level helper `broadcastEvent()` that persists outbound events (for offline/delivery history) and delegates delivery to `dispatcher`.

Why use `broadcastEvent`
- Centralizes persistence + delivery behavior in one place.
- Makes it easy to add a cross-instance backplane (Redis) without touching business logic.

Usage example

```ts
import { broadcastEvent } from "./dispatch";

broadcastEvent({
  event: "booking_update",
  data: { bookingId: "b1", status: "expired" },
  targetUserIds: [customerId],
});
```

Migration plan for Redis pub/sub (summary)
1. Add a Redis client (recommend `ioredis`) and configure via `REDIS_URL`.
2. Replace the `dispatcher` delivery in `dispatch.ts` with a call that publishes the message to a Redis channel (e.g. `realtime:outbound`).
3. Run a small "delivery worker" process on each realtime instance that subscribes to `realtime:outbound` and calls `dispatcher.sendToUser` for messages targeted to users connected to that instance.
4. Optionally persist a `nodeId` -> `userId` mapping in Redis to route messages directly to the instance that currently hosts the user, reducing cross-instance fanout.

Notes and tradeoffs
- Short-term: keep `dispatcher` for single-instance deployments; the `broadcastEvent` wrapper ensures business code is insulated from the delivery mechanism.
- Longer-term: enabling Redis pub/sub improves multi-instance delivery but requires careful handling of message ordering and at-least-once semantics.

Files to watch
- `dispatch.ts` — current wrapper
- `dispatcher.ts` — in-process delivery
- `services/*` — callers should use `broadcastEvent` (not `dispatcher` directly)

Enabling Redis pub/sub (quickstart)

1. Install the dependency:

```bash
pnpm add -w ioredis
```

2. Set the environment variable `REDIS_URL` (e.g. `redis://localhost:6379`).

3. (Optional) Provide a stable `NODE_ID` per instance. If not provided the server will set one using `hostname` and `pid`.

```bash
export NODE_ID="my-realtime-node-01"
```

4. Start a subscriber on each realtime instance. The recommended pattern is to call `startRedisSubscriber()` from the server bootstrap (this repo already does this in `src/index.ts`).

Example (server bootstrap):

```ts
import { startRedisSubscriber } from "./ws/redisSubscriber";

startRedisSubscriber().catch(console.error);
```

Registry & routing details

- Purpose: reduce cross-instance fanout by mapping which instances (nodeIds) currently host which users.
- Implementation: `ws/redisRegistry.ts` exposes `addNodeForUser(userId, nodeId)`, `removeNodeForUser(userId, nodeId)` and `getNodesForUsers(userIds)`.
- When a WebSocket connection authenticates we call `dispatcher.register()` which in turn calls `addNodeForUser(...)`. On disconnect `dispatcher.unregister()` calls `removeNodeForUser(...)`.

How publish & subscribe now work

1. `broadcastEvent()` persists the outbound event for history/offline delivery.
2. If `REDIS_URL` is present, `broadcastEvent()` will consult the registry for `targetUserIds` and include a `targetNodeIds` hint in the published payload when possible.
  - Payload shape: `{ message: { type: 'event', event, data }, targetUserIds?, targetNodeIds? }`
3. Each instance runs `startRedisSubscriber()` which subscribes to the `realtime:outbound` channel.
  - If a published payload contains `targetNodeIds` the subscriber will only process the message if the local `NODE_ID` is present in that list.
  - If no `targetNodeIds` are provided, all subscribers will process the message (broadcast).
4. When processing, the subscriber calls into the local `dispatcher` to `multicast`/`broadcast` to connected sockets.

Channels & keys

- Channel used for cross-instance delivery: `realtime:outbound`
- Per-user registry key pattern: `user:{userId}:nodes` (Redis SET)
- TTL: registry entries are set with a TTL (24h) to reduce stale entries; instances actively remove entries on disconnect.

Testing notes

- The test suite includes unit tests that mock `ioredis` to validate registry behavior and that `dispatch` includes `targetNodeIds` when the registry resolves nodes.
- For integration-style tests or local multi-instance simulation, use a real Redis (e.g., Docker) and run multiple instances with distinct `NODE_ID` values.

Production hardening suggestions

- Use a persistent `ioredis` client for subscriber/publisher with retry/backoff and connection monitoring (the current subscriber is a small, straightforward implementation).
- Consider heartbeats or ephemeral keys per connection to reduce TTL reliance.
- Account for at-least-once delivery semantics — dedupe on the client if necessary and ensure idempotent handlers.

Summary

This setup keeps the simple `dispatcher` for single-instance deployments while enabling a Redis backplane that can reduce cross-instance fanout by routing messages directly to instances that host the target users.
