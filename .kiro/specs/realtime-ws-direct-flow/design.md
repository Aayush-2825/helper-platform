# Realtime WS Direct Flow Bugfix Design

## Overview

Outbound realtime events (`publishBookingEvent`, `publishHelperPresence`, `publishLocationUpdate`) in `apps/web/src/lib/realtime/client.ts` incorrectly route through HTTP fetch calls — either to Next.js API proxy routes or directly to the Express server's `/api/realtime/broadcast` endpoint — instead of using the already-open WebSocket connection. Simultaneously, the realtime server's `socket.on("message")` handler in `apps/realtime/src/index.ts` only processes `ping` messages and silently drops everything else, and all handler files under `apps/realtime/src/handlers/` are empty stubs.

The fix has two sides: (1) refactor `client.ts` to send events over WS via a singleton `send` function, and (2) implement the server-side message router and handler stubs so incoming WS messages are dispatched to `broadcastEvent()` with the correct targets.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — when the frontend calls `publishBookingEvent`, `publishHelperPresence`, or `publishLocationUpdate`, the event travels via HTTP instead of the open WebSocket
- **Property (P)**: The desired behavior — these publish functions SHALL use the WS `send()` function, and the server SHALL route the received message to the appropriate handler
- **Preservation**: All existing behaviors not in the bug condition — ping/pong, connection ack, reconnect logic, the HTTP `/api/realtime/broadcast` endpoint, `broadcastEvent()` targeting — must remain unchanged
- **`publishBookingEvent`**: Function in `apps/web/src/lib/realtime/client.ts` that currently POSTs directly to `/api/realtime/broadcast` via fetch
- **`publishHelperPresence`**: Function in `client.ts` that currently POSTs to the Next.js proxy route `/api/realtime/ops/helper-presence`
- **`publishLocationUpdate`**: Function in `client.ts` that currently POSTs to the Next.js proxy route `/api/realtime/ops/location-updates`
- **`broadcastEvent()`**: Server-side utility in `apps/realtime/src/index.ts` that delivers a message to specific or all connected WS clients
- **`useWebSocket`**: React hook in `apps/web/src/hooks/useWebsocket.ts` that manages the WS connection and exposes a `send()` function
- **WS singleton**: A module-level reference to the WS `send` function that `client.ts` can call without being a React component

## Bug Details

### Bug Condition

The bug manifests when the frontend calls any of the three publish functions. `publishBookingEvent` bypasses the WS entirely and POSTs directly to `http://localhost:3001/api/realtime/broadcast`. `publishHelperPresence` and `publishLocationUpdate` POST to Next.js API proxy routes which then forward to the realtime server over HTTP. Even if the frontend were corrected to send over WS, the server's `socket.on("message")` handler would silently drop the message because `handlers/index.ts` is an empty stub and no routing logic exists.

**Formal Specification:**
```
FUNCTION isBugCondition(X)
  INPUT: X of type OutboundRealtimeEvent
  OUTPUT: boolean

  RETURN X.eventCategory IN {booking_request, booking_update,
                              helper_presence, location_update}
END FUNCTION
```

### Examples

- `publishBookingEvent({ bookingId: "b1", customerId: "u1", helperId: "h1", eventType: "created" })` — expected: WS message `{ type: "booking_request", ... }` sent over socket; actual: HTTP POST to `/api/realtime/broadcast`
- `publishHelperPresence({ helperUserId: "h1", status: "online" })` — expected: WS message `{ type: "helper_presence", ... }`; actual: HTTP POST to Next.js `/api/realtime/ops/helper-presence` → forwarded to Express
- `publishLocationUpdate({ helperUserId: "h1", bookingId: "b1", latitude: 12.9, longitude: 77.6 })` — expected: WS message `{ type: "location_update", ... }`; actual: HTTP POST to Next.js `/api/realtime/ops/location-updates`
- Server receives `{ type: "booking_request", bookingId: "b1", targetUserIds: ["h1"] }` over WS — expected: routed to booking handler, `broadcastEvent()` called; actual: message logged and dropped

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- WHEN the frontend sends `{ type: "ping" }` over WS, the server SHALL continue to respond with `{ type: "pong" }`
- WHEN a WS connection is established, the server SHALL continue to send `{ type: "connected", userId, timestamp }` to the client
- WHEN the WS connection drops, `useWebSocket` SHALL continue to reconnect automatically after 2 seconds
- WHEN the HTTP endpoint `POST /api/realtime/broadcast` is called (e.g., by server-side processes), `broadcastEvent()` SHALL continue to work as before
- WHEN `broadcastEvent()` is called with `targetUserIds`, it SHALL continue to deliver only to those users
- WHEN `broadcastEvent()` is called without `targetUserIds`, it SHALL continue to broadcast to all connected clients
- WHEN a user connects with a `userId` that already has an active connection, the old connection SHALL continue to be closed and replaced

**Scope:**
All inputs that do NOT match `isBugCondition` — ping/pong, connection lifecycle, the HTTP broadcast endpoint, `broadcastEvent()` internals — must be completely unaffected by this fix.

## Hypothesized Root Cause

Based on the code analysis, the causes are confirmed (not just hypothesized):

1. **`client.ts` was written before WS send was accessible as a plain module function**: `useWebSocket` exposes `send()` only as a React hook return value. `client.ts` is a plain module with no access to React context, so the original author fell back to `fetch()`. There is no WS singleton or shared send reference that non-component code can import.

2. **`socket.on("message")` handler was never extended beyond ping**: `apps/realtime/src/index.ts` has a hardcoded `if (data.type === "ping")` check with no else-routing. The `handlers/index.ts` dispatcher was stubbed but never wired in.

3. **All handler files are empty stubs**: `bookingRequest.handler.ts`, `bookingUpdate.handler.ts`, `presence.handler.ts`, `location.handler.ts` contain only a comment. No implementation exists to call `broadcastEvent()`.

4. **Next.js proxy routes duplicate logic that belongs on the server**: The booking-events proxy route re-implements the `eventType → wsEvent` mapping that already exists in `client.ts`, creating two divergent code paths for the same logic.

5. **No defined WS message contract**: There is no shared type or schema defining what a client-to-server WS message looks like for booking/presence/location events, making it easy for client and server to drift out of sync.

## Correctness Properties

Property 1: Bug Condition - Outbound Events Use WebSocket Transport

_For any_ outbound realtime event where `isBugCondition(X)` is true (i.e., `X.eventCategory` is one of `booking_request`, `booking_update`, `helper_presence`, or `location_update`), the fixed publish functions SHALL send the event as a JSON message over the open WebSocket connection using the WS singleton `send()` function, and SHALL NOT make any HTTP fetch call for that event.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Server Routes WS Messages to Handlers

_For any_ WebSocket message received by the server where `isBugCondition` holds (type is `booking_request`, `booking_update`, `helper_presence`, or `location_update`), the fixed server message router SHALL dispatch the message to the appropriate handler, which SHALL call `broadcastEvent()` with the correct `event`, `data`, and `targetUserIds`.

**Validates: Requirements 2.4, 2.5, 2.6**

Property 3: Preservation - Non-Buggy Inputs Behave Identically

_For any_ input where `isBugCondition` does NOT hold (ping/pong, connection ack, HTTP broadcast endpoint calls, `broadcastEvent()` with/without targetUserIds, reconnect logic), the fixed code SHALL produce exactly the same behavior as the original code.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Message Format Contract

Define the client-to-server WS message shapes (to be added as shared types):

```typescript
// Client → Server message types
type BookingRequestMessage = {
  type: "booking_request";
  bookingId: string;
  customerId: string;
  targetUserIds: string[]; // helper candidate IDs
  data?: Record<string, unknown>;
};

type BookingUpdateMessage = {
  type: "booking_update";
  bookingId: string;
  eventType: "accepted" | "rejected" | "cancelled" | "in_progress" | "completed";
  targetUserIds: string[]; // [customerId, helperId]
  data?: Record<string, unknown>;
};

type HelperPresenceMessage = {
  type: "helper_presence";
  helperUserId: string;
  status: "online" | "offline" | "busy" | "away";
  latitude?: number;
  longitude?: number;
  availableSlots?: number;
};

type LocationUpdateMessage = {
  type: "location_update";
  helperUserId: string;
  bookingId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
};
```

### Changes Required

**File 1: `apps/web/src/lib/realtime/wsManager.ts` (new file)**

Create a WS singleton that `client.ts` can import. This decouples the send function from the React hook lifecycle:

```typescript
// Singleton send reference — set by useWebSocket on mount
let _send: ((msg: object) => void) | null = null;

export function registerWsSend(fn: (msg: object) => void) {
  _send = fn;
}

export function wsSend(msg: object) {
  if (!_send) {
    console.warn("[WS] send called before WS initialized");
    return;
  }
  _send(msg);
}
```

**File 2: `apps/web/src/hooks/useWebsocket.ts`**

Call `registerWsSend(send)` inside the `useEffect` after `connect()` so the singleton is populated when the hook mounts.

**File 3: `apps/web/src/lib/realtime/client.ts`**

Replace the three `fetch`-based publish functions to use `wsSend()`:

1. `publishBookingEvent` — compute `wsEvent` and `targetUserIds` as before, then call `wsSend({ type: wsEvent, bookingId, targetUserIds, eventType, ...data })` instead of `fetch`
2. `publishHelperPresence` — call `wsSend({ type: "helper_presence", helperUserId, status, latitude, longitude, availableSlots })`
3. `publishLocationUpdate` — call `wsSend({ type: "location_update", helperUserId, bookingId, latitude, longitude, accuracy, speed, heading })`

Remove the `postJson` calls for these three functions. Keep `postJson` for `createIncomingJob`, `createRealtimeSubscription`, `unsubscribeRealtimeSubscription` — those are legitimate HTTP ops.

**File 4: `apps/realtime/src/handlers/index.ts`**

Implement the central dispatcher:

```typescript
import { bookingRequestHandler } from "./booking/bookingRequest.handler.js";
import { bookingUpdateHandler } from "./booking/bookingUpdate.handler.js";
import { presenceHandler } from "./helper/presence.handler.js";
import { locationHandler } from "./helper/location.handler.js";

export function routeMessage(userId: string, data: any) {
  switch (data.type) {
    case "booking_request": return bookingRequestHandler(userId, data);
    case "booking_update":  return bookingUpdateHandler(userId, data);
    case "helper_presence": return presenceHandler(userId, data);
    case "location_update": return locationHandler(userId, data);
    default:
      console.warn(`[WS] Unrecognized message type: ${data.type}`);
  }
}
```

**File 5: `apps/realtime/src/handlers/booking/bookingRequest.handler.ts`**

```typescript
export function bookingRequestHandler(userId: string, data: any) {
  const { bookingId, targetUserIds, eventType, ...rest } = data;
  broadcastEvent({ event: "booking_request", data: { bookingId, eventType, ...rest }, targetUserIds });
}
```

**File 6: `apps/realtime/src/handlers/booking/bookingUpdate.handler.ts`**

```typescript
export function bookingUpdateHandler(userId: string, data: any) {
  const { bookingId, targetUserIds, eventType, ...rest } = data;
  broadcastEvent({ event: "booking_update", data: { bookingId, eventType, ...rest }, targetUserIds });
}
```

**File 7: `apps/realtime/src/handlers/helper/presence.handler.ts`**

```typescript
export function presenceHandler(userId: string, data: any) {
  const { helperUserId, status, latitude, longitude, availableSlots } = data;
  broadcastEvent({ event: "helper_presence", data: { helperUserId, status, latitude, longitude, availableSlots } });
}
```

**File 8: `apps/realtime/src/handlers/helper/location.handler.ts`**

```typescript
export function locationHandler(userId: string, data: any) {
  const { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading } = data;
  broadcastEvent({ event: "location_update", data: { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading } });
}
```

**File 9: `apps/realtime/src/index.ts`**

Wire `routeMessage` into the `socket.on("message")` handler:

```typescript
import { routeMessage } from "./handlers/index.js";

// Inside socket.on("message"):
if (data.type === "ping") {
  socket.send(JSON.stringify({ type: "pong" }));
  return;
}
routeMessage(userId, data);
```

**File 10: Next.js proxy routes (deprecate)**

The routes at `apps/web/src/app/api/realtime/ops/booking-events/route.ts` and `apps/web/src/app/api/realtime/ops/helper-presence/route.ts` are no longer called by the frontend. They can be left in place (they don't break anything and may be called by other server-side code) or removed. The fix does not require deleting them, but a follow-up cleanup task should remove them to avoid confusion.

## Testing Strategy

### Validation Approach

Two-phase approach: first run tests against the unfixed code to surface counterexamples and confirm root cause, then verify the fix satisfies both correctness properties and preserves all unchanged behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm the root cause analysis.

**Test Plan**: Mock the WS `send` function and `fetch`, then call each publish function. Assert that `send` is called and `fetch` is NOT called. On unfixed code these assertions will fail, confirming the bug.

**Test Cases**:
1. **Booking Request via WS**: Call `publishBookingEvent({ eventType: "created", ... })` with WS send mocked — assert `send` called with `{ type: "booking_request" }`, assert `fetch` not called (will fail on unfixed code)
2. **Booking Update via WS**: Call `publishBookingEvent({ eventType: "accepted", ... })` — assert `send` called with `{ type: "booking_update" }` (will fail on unfixed code)
3. **Presence via WS**: Call `publishHelperPresence({ helperUserId: "h1", status: "online" })` — assert `send` called, `fetch` not called (will fail on unfixed code)
4. **Location via WS**: Call `publishLocationUpdate({ helperUserId: "h1", bookingId: "b1", latitude: 12.9, longitude: 77.6 })` — assert `send` called (will fail on unfixed code)
5. **Server drops non-ping**: Send `{ type: "booking_request", ... }` to the server WS handler, assert `routeMessage` is called (will fail on unfixed code — handler not wired)

**Expected Counterexamples**:
- `fetch` is called instead of `send` for all three publish functions
- Server `routeMessage` is never invoked; message is only logged

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result := publishEvent_fixed(X)
  ASSERT result.transport = "websocket"
  ASSERT fetch_not_called()
  ASSERT wsSend_called_with_correct_type(X.eventCategory)

  serverResult := routeMessage_fixed(userId, X)
  ASSERT broadcastEvent_called_with(event: X.eventCategory, targetUserIds: X.targetUserIds)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, behavior is identical before and after the fix.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

**Testing Approach**: Property-based testing is well-suited here because the preservation domain is large — any combination of ping messages, connection events, HTTP broadcast calls, and `broadcastEvent()` invocations must all behave identically.

**Test Cases**:
1. **Ping/Pong Preservation**: Send `{ type: "ping" }` over WS — assert server responds with `{ type: "pong" }` (unchanged)
2. **Connection Ack Preservation**: Connect a new WS client — assert `{ type: "connected", userId, timestamp }` is received
3. **HTTP Broadcast Preservation**: POST to `/api/realtime/broadcast` with `{ event, data, targetUserIds }` — assert `broadcastEvent()` is called and target clients receive the message
4. **broadcastEvent targetUserIds Preservation**: Call `broadcastEvent({ event: "x", data: {}, targetUserIds: ["u1"] })` — assert only `u1` receives the message
5. **broadcastEvent broadcast-all Preservation**: Call `broadcastEvent({ event: "x", data: {} })` — assert all connected clients receive the message
6. **Non-publish functions in client.ts**: Call `createIncomingJob`, `createRealtimeSubscription`, `unsubscribeRealtimeSubscription` — assert they still use `postJson` (HTTP), not WS send

### Unit Tests

- Test `publishBookingEvent` with `eventType: "created"` sends `{ type: "booking_request" }` over WS with correct `targetUserIds`
- Test `publishBookingEvent` with `eventType: "accepted"` sends `{ type: "booking_update" }` with `[customerId, helperId]` as targets
- Test `publishHelperPresence` sends `{ type: "helper_presence" }` with all fields
- Test `publishLocationUpdate` sends `{ type: "location_update" }` with all fields
- Test `routeMessage` dispatches `booking_request` to `bookingRequestHandler`
- Test `routeMessage` dispatches `booking_update` to `bookingUpdateHandler`
- Test `routeMessage` dispatches `helper_presence` to `presenceHandler`
- Test `routeMessage` dispatches `location_update` to `locationHandler`
- Test `routeMessage` with unknown type logs warning and does not throw
- Test `bookingRequestHandler` calls `broadcastEvent` with correct event name and targetUserIds
- Test `presenceHandler` calls `broadcastEvent` with `event: "helper_presence"`
- Test `locationHandler` calls `broadcastEvent` with `event: "location_update"`

### Property-Based Tests

- Generate random `{ eventType, bookingId, customerId, helperId }` combinations and verify `publishBookingEvent` always calls WS send (never fetch) and the message type is always `booking_request` or `booking_update` based on `eventType`
- Generate random presence payloads and verify `publishHelperPresence` always produces a WS message with `type: "helper_presence"` and all provided fields present
- Generate random sets of connected userIds and verify `broadcastEvent` with `targetUserIds` delivers to exactly those users and no others (preservation of targeting logic)
- Generate random non-buggy message types and verify `routeMessage` never throws and always logs a warning for unrecognized types

### Integration Tests

- Full flow: frontend calls `publishBookingEvent` → WS message arrives at server → `routeMessage` dispatches to handler → `broadcastEvent` delivers to target helper's WS connection
- Full flow: frontend calls `publishHelperPresence` → server routes to presence handler → all relevant subscribers receive `helper_presence` event
- Full flow: frontend calls `publishLocationUpdate` → server routes to location handler → booking participant receives `location_update`
- Regression: ping/pong still works after the message router is wired in
- Regression: HTTP `/api/realtime/broadcast` endpoint still delivers events after the WS routing changes
