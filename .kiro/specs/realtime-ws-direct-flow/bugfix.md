# Bugfix Requirements Document

## Introduction

Outbound realtime events from the frontend take an unnecessary HTTP round-trip through Next.js API proxy routes before reaching the Express/WebSocket server. The WebSocket connection is already open and capable of sending messages, but `publishBookingEvent()`, `publishHelperPresence()`, and `publishLocationUpdate()` in `client.ts` all use `fetch()` to POST to Next.js routes, which then forward to the realtime server's `/api/realtime/broadcast` HTTP endpoint. This indirect path adds latency, unnecessary infrastructure coupling, and bypasses the already-established WebSocket channel. Additionally, the realtime server's `socket.on("message")` handler only processes `ping` messages and ignores all other incoming client messages, so even if the frontend sent events over WS, the server would silently drop them.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the frontend calls `publishBookingEvent()` THEN the system sends an HTTP POST to a Next.js API route (`/api/realtime/ops/booking-events`) instead of using the open WebSocket connection

1.2 WHEN the frontend calls `publishHelperPresence()` THEN the system sends an HTTP POST to a Next.js API route (`/api/realtime/ops/helper-presence`) instead of using the open WebSocket connection

1.3 WHEN the frontend calls `publishLocationUpdate()` THEN the system sends an HTTP POST to a Next.js API route (`/api/realtime/ops/location-updates`) instead of using the open WebSocket connection

1.4 WHEN the Next.js API proxy routes receive a booking/presence/location POST THEN the system re-forwards the request via HTTP to the Express realtime server at `/api/realtime/broadcast`, adding an extra network hop

1.5 WHEN the realtime server receives a WebSocket message with a type other than `ping` from a connected client THEN the system logs the message but takes no action and does not route it to any handler

1.6 WHEN the frontend sends a `booking_request`, `booking_update`, `helper_presence`, or `location_update` message over WebSocket THEN the system does not broadcast or route it because `handlers/index.ts` and the booking/presence/location handler files are empty stubs

### Expected Behavior (Correct)

2.1 WHEN the frontend needs to publish a booking event THEN the system SHALL send the event as a structured JSON message directly over the open WebSocket connection using the existing `send()` function from `useWebSocket`

2.2 WHEN the frontend needs to publish a helper presence update THEN the system SHALL send the event as a structured JSON message directly over the open WebSocket connection

2.3 WHEN the frontend needs to publish a location update THEN the system SHALL send the event as a structured JSON message directly over the open WebSocket connection

2.4 WHEN the realtime server receives a WebSocket message with type `booking_request` or `booking_update` THEN the system SHALL route it to the appropriate booking handler which broadcasts to the target user(s)

2.5 WHEN the realtime server receives a WebSocket message with type `helper_presence` THEN the system SHALL route it to the presence handler which broadcasts the presence update to relevant subscribers

2.6 WHEN the realtime server receives a WebSocket message with type `location_update` THEN the system SHALL route it to the location handler which broadcasts the location update to relevant subscribers

2.7 WHEN a WS message arrives at the realtime server with an unrecognized type THEN the system SHALL log a warning and ignore it without crashing

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the WebSocket connection is established THEN the system SHALL CONTINUE TO send a `connected` acknowledgement to the client with `userId` and `timestamp`

3.2 WHEN the frontend sends a `ping` message over WebSocket THEN the system SHALL CONTINUE TO respond with a `pong` message

3.3 WHEN the WebSocket connection drops THEN the system SHALL CONTINUE TO reconnect automatically via the existing reconnect logic in `useWebSocket`

3.4 WHEN the realtime server's `/api/realtime/broadcast` HTTP endpoint is called THEN the system SHALL CONTINUE TO broadcast events to target users (this endpoint may still be used by server-side processes)

3.5 WHEN a user connects with a `userId` that already has an active connection THEN the system SHALL CONTINUE TO close the old connection and register the new one

3.6 WHEN `broadcastEvent()` is called with `targetUserIds` THEN the system SHALL CONTINUE TO deliver the message only to those specific connected clients

3.7 WHEN `broadcastEvent()` is called without `targetUserIds` THEN the system SHALL CONTINUE TO deliver the message to all connected clients

---

## Bug Condition Pseudocode

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type OutboundRealtimeEvent
  OUTPUT: boolean

  // Bug is triggered when the frontend attempts to publish
  // a booking, presence, or location event
  RETURN X.eventCategory IN {booking_request, booking_update,
                              helper_presence, location_update}
END FUNCTION
```

```pascal
// Property: Fix Checking
FOR ALL X WHERE isBugCondition(X) DO
  result ← publishEvent'(X)
  ASSERT result.transport = "websocket"
  ASSERT no_http_proxy_call(result)
  ASSERT server_routed_to_handler(result)
END FOR
```

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
  // ping/pong, connection ack, broadcast HTTP endpoint,
  // reconnect logic all behave identically
END FOR
```
