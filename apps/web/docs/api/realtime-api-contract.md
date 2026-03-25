# Realtime API Contract (MVP)

## Purpose

Define concrete API contracts for:

1. HTTP command endpoints (state mutations)
2. WebSocket subscriptions and emitted events (state propagation)
3. Shared TypeScript payload types for client and server

Use this with the architecture strategy in `docs/architecture/realtime-transport-strategy.md`.

## Design Principles

1. Commands are HTTP only.
2. Events are WebSocket only.
3. Events are emitted only after successful database commit.
4. Every event includes an incrementing `version` per aggregate (`bookingId`, `disputeId`, etc.).
5. Clients always recover from disconnect via HTTP snapshot fetch.

## Auth and Security

### HTTP

- Use existing Better Auth session/cookie middleware.
- Authorize by role and ownership.

### WebSocket Handshake

- Endpoint: `GET /api/realtime/ws`
- Authentication: existing session cookie or short-lived bearer token.
- Reject unauthenticated handshake with `401`.
- Reject unauthorized channel joins with `403`.

### Channel Scope

- `user:{userId}`
- `booking:{bookingId}`
- `org:{orgId}:admin`
- `org:{orgId}:verification`

## HTTP Command Endpoints

## Bookings

### Create Booking

- Method: `POST`
- Path: `/api/bookings`

Request:

```json
{
  "serviceCategory": "plumber",
  "serviceSubcategory": "leak-repair",
  "location": {
    "lat": 12.9123,
    "lng": 77.6421,
    "address": "Koramangala, Bengaluru"
  },
  "notes": "Kitchen sink leakage",
  "paymentMode": "upi"
}
```

Response `201`:

```json
{
  "bookingId": "bk_123",
  "status": "requested",
  "version": 1,
  "createdAt": "2026-03-22T12:00:00.000Z"
}
```

Emits:

- `booking.requested`

### Accept Booking (Helper)

- Method: `POST`
- Path: `/api/bookings/{bookingId}/accept`

Response `200`:

```json
{
  "bookingId": "bk_123",
  "status": "accepted",
  "version": 4
}
```

Emits:

- `booking.accepted`

### Reject Booking (Helper)

- Method: `POST`
- Path: `/api/bookings/{bookingId}/reject`

Response `200`:

```json
{
  "bookingId": "bk_123",
  "status": "rejected",
  "version": 4,
  "reason": "distance_too_far"
}
```

Emits:

- `booking.rejected`

### Start Booking

- Method: `POST`
- Path: `/api/bookings/{bookingId}/start`

Response `200`:

```json
{
  "bookingId": "bk_123",
  "status": "started",
  "version": 6,
  "startedAt": "2026-03-22T12:40:00.000Z"
}
```

Emits:

- `booking.started`

### Complete Booking

- Method: `POST`
- Path: `/api/bookings/{bookingId}/complete`

Response `200`:

```json
{
  "bookingId": "bk_123",
  "status": "completed",
  "version": 8,
  "completedAt": "2026-03-22T13:20:00.000Z"
}
```

Emits:

- `booking.completed`

### Cancel Booking

- Method: `POST`
- Path: `/api/bookings/{bookingId}/cancel`

Request:

```json
{
  "reason": "customer_unavailable"
}
```

Response `200`:

```json
{
  "bookingId": "bk_123",
  "status": "cancelled",
  "version": 5,
  "reason": "customer_unavailable"
}
```

Emits:

- `booking.cancelled`

### Booking Snapshot

- Method: `GET`
- Path: `/api/bookings/{bookingId}`

Response `200`:

```json
{
  "bookingId": "bk_123",
  "status": "accepted",
  "version": 4,
  "customerId": "usr_1",
  "helperId": "hlp_9",
  "timeline": [
    {
      "event": "booking.requested",
      "occurredAt": "2026-03-22T12:00:00.000Z",
      "version": 1
    },
    {
      "event": "booking.accepted",
      "occurredAt": "2026-03-22T12:04:00.000Z",
      "version": 4
    }
  ]
}
```

## Payments

### Create Payment Intent

- Method: `POST`
- Path: `/api/payments/intents`

Request:

```json
{
  "bookingId": "bk_123",
  "amount": 79900,
  "currency": "INR",
  "mode": "upi"
}
```

Response `201`:

```json
{
  "paymentIntentId": "pi_123",
  "status": "requires_confirmation",
  "clientSecret": "secret_abc"
}
```

### Confirm Payment

- Method: `POST`
- Path: `/api/payments/{paymentIntentId}/confirm`

Response `200`:

```json
{
  "paymentIntentId": "pi_123",
  "status": "succeeded",
  "bookingId": "bk_123"
}
```

Emits:

- `payment.succeeded` or `payment.failed`

## Disputes

### Create Dispute

- Method: `POST`
- Path: `/api/disputes`

Request:

```json
{
  "bookingId": "bk_123",
  "reason": "quality_issue",
  "description": "Service quality did not match listing"
}
```

Response `201`:

```json
{
  "disputeId": "dp_1001",
  "status": "open",
  "createdAt": "2026-03-22T14:00:00.000Z"
}
```

Emits:

- `dispute.created`

### Update Dispute Status (Admin)

- Method: `POST`
- Path: `/api/disputes/{disputeId}/status`

Request:

```json
{
  "status": "resolved",
  "resolution": "partial_refund",
  "note": "Approved after evidence review"
}
```

Response `200`:

```json
{
  "disputeId": "dp_1001",
  "status": "resolved",
  "updatedAt": "2026-03-22T16:00:00.000Z"
}
```

Emits:

- `dispute.updated`

## Verification

### Decide Verification (Admin)

- Method: `POST`
- Path: `/api/verifications/{verificationId}/decision`

Request:

```json
{
  "decision": "approved",
  "note": "KYC documents valid"
}
```

Response `200`:

```json
{
  "verificationId": "vf_2001",
  "decision": "approved",
  "helperId": "hlp_9"
}
```

Emits:

- `verification.updated`

## WebSocket Protocol

## Client Messages

### Subscribe

```json
{
  "type": "subscribe",
  "channels": ["booking:bk_123", "user:usr_1"],
  "requestId": "req_1"
}
```

### Unsubscribe

```json
{
  "type": "unsubscribe",
  "channels": ["booking:bk_123"],
  "requestId": "req_2"
}
```

### Ping

```json
{
  "type": "ping",
  "ts": 1710000000000
}
```

## Server Messages

### Subscription Ack

```json
{
  "type": "ack",
  "requestId": "req_1",
  "accepted": ["booking:bk_123"],
  "rejected": []
}
```

### Event Envelope

```json
{
  "type": "event",
  "channel": "booking:bk_123",
  "event": "booking.accepted",
  "occurredAt": "2026-03-22T12:04:00.000Z",
  "aggregateId": "bk_123",
  "version": 4,
  "actorRole": "helper",
  "actorId": "hlp_9",
  "organizationId": "org_1",
  "data": {
    "status": "accepted",
    "etaMinutes": 12
  }
}
```

### Error

```json
{
  "type": "error",
  "code": "forbidden_channel",
  "message": "Not authorized to subscribe to channel",
  "requestId": "req_1"
}
```

## Event Catalog

- `booking.requested`
- `booking.assigned`
- `booking.accepted`
- `booking.rejected`
- `booking.expired`
- `booking.started`
- `booking.completed`
- `booking.cancelled`
- `payment.succeeded`
- `payment.failed`
- `dispute.created`
- `dispute.updated`
- `verification.updated`
- `notification.created`

## TypeScript Contract Types

```ts
export type RealtimeEventName =
  | "booking.requested"
  | "booking.assigned"
  | "booking.accepted"
  | "booking.rejected"
  | "booking.expired"
  | "booking.started"
  | "booking.completed"
  | "booking.cancelled"
  | "payment.succeeded"
  | "payment.failed"
  | "dispute.created"
  | "dispute.updated"
  | "verification.updated"
  | "notification.created";

export type RealtimeChannel =
  | `user:${string}`
  | `booking:${string}`
  | `org:${string}:admin`
  | `org:${string}:verification`;

export interface RealtimeEnvelope<T = Record<string, unknown>> {
  type: "event";
  channel: RealtimeChannel;
  event: RealtimeEventName;
  occurredAt: string;
  aggregateId: string;
  version: number;
  actorRole?: "customer" | "helper" | "admin" | "system";
  actorId?: string;
  organizationId?: string;
  data: T;
}

export interface SubscribeMessage {
  type: "subscribe";
  channels: RealtimeChannel[];
  requestId: string;
}

export interface UnsubscribeMessage {
  type: "unsubscribe";
  channels: RealtimeChannel[];
  requestId: string;
}

export interface AckMessage {
  type: "ack";
  requestId: string;
  accepted: RealtimeChannel[];
  rejected: RealtimeChannel[];
}

export interface ErrorMessage {
  type: "error";
  code: string;
  message: string;
  requestId?: string;
}
```

## Client Reconnection and Recovery

1. Reconnect using exponential backoff with jitter.
2. Resubscribe all channels after reconnect.
3. If disconnected for more than 10 seconds, start temporary polling.
4. Immediately fetch HTTP snapshot for affected aggregate:
   - booking details for `booking:{id}`
   - dispute details for dispute channel if implemented
5. Drop stale event if incoming `version` is less than or equal to last applied version.

## Error Codes

- `unauthenticated`
- `forbidden_channel`
- `invalid_message`
- `unsupported_channel`
- `rate_limited`
- `server_unavailable`

## Polling Fallback Defaults

- Active booking timeline: 5-10s while socket is down
- Helper incoming jobs queue: 3-5s while socket is down
- Admin live bookings board: 5-10s while socket is down
- Analytics/history pages: 30-120s normal polling

## Versioning and Compatibility

1. Additive changes are preferred (new optional fields/events).
2. Breaking changes require:
   - new event name suffix or
   - protocol version gate in handshake metadata.

Recommended header for HTTP command APIs:

- `x-api-version: 2026-03-22`
