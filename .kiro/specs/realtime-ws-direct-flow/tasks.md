# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Outbound Events Use HTTP Instead of WebSocket
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases — one test per publish function
  - Mock `wsSend` and `fetch` globally before each assertion
  - Test 1: Call `publishBookingEvent({ bookingId: "b1", customerId: "u1", helperId: "h1", eventType: "created" })` — assert `wsSend` called with `{ type: "booking_request" }`, assert `fetch` NOT called
  - Test 2: Call `publishBookingEvent({ bookingId: "b1", customerId: "u1", helperId: "h1", eventType: "accepted" })` — assert `wsSend` called with `{ type: "booking_update" }`, assert `fetch` NOT called
  - Test 3: Call `publishHelperPresence({ helperUserId: "h1", status: "online" })` — assert `wsSend` called with `{ type: "helper_presence" }`, assert `fetch` NOT called
  - Test 4: Call `publishLocationUpdate({ helperUserId: "h1", bookingId: "b1", latitude: 12.9, longitude: 77.6 })` — assert `wsSend` called with `{ type: "location_update" }`, assert `fetch` NOT called
  - Test 5: Invoke the server `socket.on("message")` handler with `{ type: "booking_request", ... }` — assert `routeMessage` is called (will fail because handler is not wired)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL — counterexamples: `fetch` is called instead of `wsSend` for all three publish functions; server `routeMessage` is never invoked
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Inputs Behave Identically
  - **IMPORTANT**: Follow observation-first methodology — run UNFIXED code with non-buggy inputs and record actual outputs
  - Observe: sending `{ type: "ping" }` to the server WS handler returns `{ type: "pong" }` on unfixed code
  - Observe: a new WS connection receives `{ type: "connected", userId, timestamp }` on unfixed code
  - Observe: POST to `/api/realtime/broadcast` with `{ event, data, targetUserIds }` calls `broadcastEvent()` and delivers to target clients on unfixed code
  - Observe: `broadcastEvent({ event: "x", data: {}, targetUserIds: ["u1"] })` delivers only to `u1` on unfixed code
  - Observe: `broadcastEvent({ event: "x", data: {} })` delivers to all connected clients on unfixed code
  - Observe: `createIncomingJob`, `createRealtimeSubscription`, `unsubscribeRealtimeSubscription` all use `postJson` (HTTP) on unfixed code
  - Write property-based test: for any `{ type: "ping" }` message, server always responds `{ type: "pong" }` (from Preservation Requirements 3.2)
  - Write property-based test: for any set of connected userIds, `broadcastEvent` with `targetUserIds` delivers to exactly those users and no others (from Preservation Requirements 3.6)
  - Write property-based test: for any non-publish function call (`createIncomingJob`, `createRealtimeSubscription`, `unsubscribeRealtimeSubscription`), `fetch` is always called and `wsSend` is never called
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS — confirms baseline behavior to preserve
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix: route outbound realtime events over WebSocket instead of HTTP

  - [x] 3.1 Create `apps/web/src/lib/realtime/wsManager.ts` singleton
    - Create new file with module-level `_send` reference initialized to `null`
    - Export `registerWsSend(fn)` that sets `_send = fn`
    - Export `wsSend(msg)` that calls `_send(msg)` if set, logs warning if not
    - _Bug_Condition: isBugCondition(X) where X.eventCategory IN {booking_request, booking_update, helper_presence, location_update}_
    - _Expected_Behavior: wsSend(msg) dispatches over the open WebSocket connection_
    - _Preservation: no changes to ping/pong, connection ack, or HTTP broadcast endpoint_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Update `apps/web/src/hooks/useWebsocket.ts` to register send with singleton
    - Import `registerWsSend` from `../lib/realtime/wsManager`
    - Inside the `useEffect`, after `connect()`, call `registerWsSend(send)` so the singleton is populated when the hook mounts
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Refactor `publishBookingEvent` in `apps/web/src/lib/realtime/client.ts` to use `wsSend`
    - Import `wsSend` from `./wsManager`
    - Keep existing `wsEvent` and `targetUserIds` computation logic unchanged
    - Replace the `fetch(...)` call with `wsSend({ type: wsEvent, bookingId, eventType, targetUserIds, ...data })`
    - Remove the `try/catch` fetch block for this function
    - _Bug_Condition: isBugCondition(X) where X.eventCategory IN {booking_request, booking_update}_
    - _Expected_Behavior: wsSend called with correct type and targetUserIds, fetch NOT called_
    - _Requirements: 2.1_

  - [x] 3.4 Refactor `publishHelperPresence` in `apps/web/src/lib/realtime/client.ts` to use `wsSend`
    - Replace `postJson("/api/realtime/ops/helper-presence", input)` with `wsSend({ type: "helper_presence", ...input })`
    - _Bug_Condition: isBugCondition(X) where X.eventCategory = helper_presence_
    - _Expected_Behavior: wsSend called with { type: "helper_presence", helperUserId, status, ... }, fetch NOT called_
    - _Requirements: 2.2_

  - [x] 3.5 Refactor `publishLocationUpdate` in `apps/web/src/lib/realtime/client.ts` to use `wsSend`
    - Replace `postJson("/api/realtime/ops/location-updates", input)` with `wsSend({ type: "location_update", ...input })`
    - _Bug_Condition: isBugCondition(X) where X.eventCategory = location_update_
    - _Expected_Behavior: wsSend called with { type: "location_update", helperUserId, bookingId, latitude, longitude, ... }, fetch NOT called_
    - _Requirements: 2.3_

  - [x] 3.6 Implement `routeMessage` dispatcher in `apps/realtime/src/handlers/index.ts`
    - Import `bookingRequestHandler`, `bookingUpdateHandler`, `presenceHandler`, `locationHandler`
    - Export `routeMessage(userId, data)` with a switch on `data.type`
    - Cases: `booking_request`, `booking_update`, `helper_presence`, `location_update`
    - Default case: `console.warn("[WS] Unrecognized message type:", data.type)`
    - _Bug_Condition: isBugCondition(X) where X.type IN {booking_request, booking_update, helper_presence, location_update}_
    - _Expected_Behavior: dispatches to correct handler which calls broadcastEvent()_
    - _Requirements: 2.4, 2.5, 2.6, 2.7_

  - [x] 3.7 Implement `bookingRequestHandler` in `apps/realtime/src/handlers/booking/bookingRequest.handler.ts`
    - Import `broadcastEvent` from `../../index.js`
    - Destructure `bookingId`, `targetUserIds`, `eventType`, rest from `data`
    - Call `broadcastEvent({ event: "booking_request", data: { bookingId, eventType, ...rest }, targetUserIds })`
    - _Requirements: 2.4_

  - [x] 3.8 Implement `bookingUpdateHandler` in `apps/realtime/src/handlers/booking/bookingUpdate.handler.ts`
    - Import `broadcastEvent` from `../../index.js`
    - Destructure `bookingId`, `targetUserIds`, `eventType`, rest from `data`
    - Call `broadcastEvent({ event: "booking_update", data: { bookingId, eventType, ...rest }, targetUserIds })`
    - _Requirements: 2.4_

  - [x] 3.9 Implement `presenceHandler` in `apps/realtime/src/handlers/helper/presence.handler.ts`
    - Import `broadcastEvent` from `../../index.js`
    - Destructure `helperUserId`, `status`, `latitude`, `longitude`, `availableSlots` from `data`
    - Call `broadcastEvent({ event: "helper_presence", data: { helperUserId, status, latitude, longitude, availableSlots } })`
    - _Requirements: 2.5_

  - [x] 3.10 Implement `locationHandler` in `apps/realtime/src/handlers/helper/location.handler.ts`
    - Import `broadcastEvent` from `../../index.js`
    - Destructure `helperUserId`, `bookingId`, `latitude`, `longitude`, `accuracy`, `speed`, `heading` from `data`
    - Call `broadcastEvent({ event: "location_update", data: { helperUserId, bookingId, latitude, longitude, accuracy, speed, heading } })`
    - _Requirements: 2.6_

  - [x] 3.11 Wire `routeMessage` into `socket.on("message")` in `apps/realtime/src/index.ts`
    - Import `routeMessage` from `./handlers/index.js`
    - In the `socket.on("message")` handler, after the `ping` check, add `routeMessage(userId, data)` in the else branch
    - Preserve the existing `if (data.type === "ping")` block unchanged
    - _Bug_Condition: server silently drops non-ping WS messages_
    - _Expected_Behavior: non-ping messages are dispatched via routeMessage_
    - _Preservation: ping/pong behavior unchanged_
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 3.2_

  - [x] 3.12 Deprecate Next.js API proxy routes for booking-events, helper-presence, location-updates
    - Add a deprecation comment at the top of `apps/web/src/app/api/realtime/ops/booking-events/route.ts`
    - Add a deprecation comment at the top of `apps/web/src/app/api/realtime/ops/helper-presence/route.ts`
    - Add a deprecation comment at the top of `apps/web/src/app/api/realtime/ops/location-updates/route.ts` (if it exists)
    - Comment: `// DEPRECATED: Frontend now sends these events directly over WebSocket via wsSend(). This route is no longer called by the frontend and can be removed in a follow-up cleanup.`
    - Do NOT delete the files yet — they may still be called by other server-side processes
    - _Requirements: 1.4_

  - [x] 3.13 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Outbound Events Use WebSocket Transport
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run all five bug condition tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.14 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Inputs Behave Identically
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm ping/pong, connection ack, HTTP broadcast endpoint, broadcastEvent targeting, and non-publish HTTP functions all behave identically

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite for both `apps/realtime` and `apps/web`
  - Confirm Property 1 (bug condition) tests pass
  - Confirm Property 2 (preservation) tests pass
  - Confirm no TypeScript errors in modified files
  - Ensure all tests pass; ask the user if questions arise
