# Realtime Transport Strategy (MVP)

## Purpose

Define when to use WebSockets, HTTP requests, or polling across customer, helper, seller, and admin portals.

This strategy follows the MVP product requirements:
- low-latency booking lifecycle updates
- reliable transactional APIs for state changes
- cost-conscious refresh behavior for analytics/history views

## Decision Rules

1. Use **HTTP** for all state-changing commands.
2. Use **WebSockets** for live state propagation where users wait on immediate updates.
3. Use **Polling** for low-urgency aggregate/history views.
4. Keep a polling fallback for any WebSocket-powered screen.

## Route Transport Matrix

| Route | Primary Transport | Why |
|---|---|---|
| `/` | HTTP | Marketing/discovery is request-response and cacheable. |
| `/auth/*` | HTTP | Authentication is transactional and security-sensitive. |
| `/dashboard` | HTTP | Role routing and initial data fetch only. |
| `/account/settings` | HTTP | Profile/security updates are form-based actions. |
| `/customer` | WebSocket + HTTP | Active booking card should update instantly; actions still via HTTP. |
| `/customer/book` | HTTP | Booking creation and edits are command APIs. |
| `/customer/bookings` | WebSocket + polling fallback | Current booking timeline should be live; history can refresh on interval. |
| `/customer/payments` | HTTP + light polling | Payment states are action-based; pending statuses can poll. |
| `/customer/reviews` | HTTP | Reviews are submit/edit/list flows. |
| `/helper` | WebSocket + HTTP | Live workload summary and assignment status updates. |
| `/helper/incoming-jobs` | WebSocket + polling fallback | Time-sensitive accept/reject queue requires push. |
| `/helper/availability` | HTTP | Online/offline toggle and schedule updates are commands. |
| `/helper/job-history` | HTTP + polling | Historical data; near-real-time not critical. |
| `/helper/earnings` | HTTP + polling | Aggregated financial data can refresh periodically. |
| `/helper/verification` | HTTP + polling | Verification changes are infrequent, periodic refresh is enough. |
| `/seller/onboarding` | HTTP | Multi-step submit/upload flow is transactional. |
| `/seller/verification-pending` | Polling + manual refresh | Status changes infrequent and admin-driven. |
| `/admin` | HTTP + optional WebSocket summary events | Snapshot can load via HTTP; alert counters may be pushed. |
| `/admin/analytics` | Polling | KPI dashboards do not need per-second updates. |
| `/admin/users` | HTTP | CRUD and moderation actions. |
| `/admin/helpers` | HTTP + optional WebSocket flags | Primary management via HTTP; live risk flags can be pushed. |
| `/admin/verifications` | HTTP + WebSocket queue events | Queue updates benefit from push while decisions are HTTP. |
| `/admin/bookings` | WebSocket + HTTP | Live operations console needs immediate booking transitions. |
| `/admin/payments` | HTTP + polling | Incident queues and reconciliation can refresh on interval. |
| `/admin/disputes` | HTTP + polling (+ optional case events) | List is periodic; active case notes can use push if needed. |

## Feature-Level Guidance

### Must Use WebSockets (MVP)

1. Helper incoming job dispatch and timeout updates.
2. Customer active booking lifecycle timeline.
3. Admin live booking monitor.
4. In-app alerts for critical events:
   - booking assigned/expired/cancelled
   - payment failure requiring retry
   - dispute status changed
   - helper verification decision

### Should Stay HTTP-Only (MVP)

1. Auth and session flows.
2. Booking create/update/accept/reject/complete commands.
3. Payments create/confirm/refund flows.
4. KYC uploads and onboarding submissions.
5. Reviews and moderation actions.
6. Admin decision workflows and CRUD operations.

### Polling Targets (MVP)

| Area | Interval |
|---|---|
| Admin analytics | 30-60s |
| Helper earnings/payout summaries | 30-120s |
| Booking history pages | 60-120s |
| Seller verification pending | 30-60s |
| Admin disputes list | 20-60s |

## Suggested Realtime Event Contract

Use WebSockets only for events. Persist state changes via HTTP endpoints.

### Event Names

- `booking.requested`
- `booking.assigned`
- `booking.accepted`
- `booking.rejected`
- `booking.expired`
- `booking.started`
- `booking.completed`
- `booking.cancelled`
- `payment.failed`
- `payment.succeeded`
- `dispute.created`
- `dispute.updated`
- `verification.updated`
- `notification.created`

### Canonical Payload Shape

```json
{
  "event": "booking.accepted",
  "occurredAt": "2026-03-22T12:00:00.000Z",
  "bookingId": "bk_123",
  "actorRole": "helper",
  "actorId": "usr_456",
  "organizationId": "org_789",
  "version": 12,
  "data": {
    "status": "accepted",
    "helperId": "hlp_001"
  }
}
```

## Channels and Authorization

Use scoped channels/rooms:

- `user:{userId}` for personal notifications
- `booking:{bookingId}` for booking participants
- `role:admin` (or tenant-scoped `org:{orgId}:admin`) for operations feeds
- `org:{orgId}:verification` for verification queues

Authorization rules:

1. Authenticate WebSocket handshake using existing session/JWT.
2. Authorize room joins by role and object ownership.
3. Never broadcast cross-tenant events to global rooms.
4. Include server-generated monotonically increasing `version` for ordering.

## Reliability and Fallback

1. Auto-reconnect with exponential backoff.
2. On reconnect, fetch latest snapshot over HTTP, then resume events.
3. If socket disconnected for more than 10s, enable temporary polling.
4. Deduplicate events by `(event, bookingId, version)`.
5. Apply idempotent reducers on client state updates.

## Operational Targets

1. Booking lifecycle event fan-out latency: p95 under 2s.
2. API command latency for core booking actions: p95 under 500ms.
3. Missed-event recovery window: up to last 5 minutes using HTTP snapshot.

## Implementation Order (Recommended)

1. Build HTTP-first booking/payment/dispute APIs and state machine.
2. Add WebSocket gateway for booking lifecycle events.
3. Integrate helper incoming jobs and customer active timeline.
4. Add admin live booking board stream.
5. Add socket fallback polling and reconnect recovery.
6. Add optional realtime streams for disputes and verification queues.

## Quick Checklist

- [ ] Every mutation endpoint remains HTTP.
- [ ] WebSockets emit events only after successful DB commit.
- [ ] Each realtime screen has polling fallback.
- [ ] Events are tenant-scoped and role-authorized.
- [ ] Client handles out-of-order or duplicate events safely.
