# Features & Core User Flows

This file lists the primary product features and their main user journeys.

## Primary Features

- Booking lifecycle: create, request, match, accept/reject, start, complete, cancel.
- Matching/candidate flow: helper discovery, offer, acceptance, timeouts and fallback matching.
- Video KYC onboarding: schedule via Google Calendar, join via hosted or Jitsi fallback.
- Realtime updates: booking status, helper presence, location and messages via WebSockets.
- Payments: integrate with Razorpay for payments and webhooks; payouts tracking for helpers.
- Reviews & disputes: customers can rate helpers and file disputes; admin review flows.
- Notifications: push & in-app notifications with offline persistence and replay.
- Admin analytics: aggregated data and dashboards for operations.

## Core User Flows

1. Customer books a helper
   - Customer fills booking form -> Next API writes booking -> matching engine finds helpers -> helpers receive booking_request events -> helper accepts -> booking moves to in_progress -> payment and receipts handled via Razorpay.

2. Helper onboarding & verification
   - Helper submits documents -> admin queue or auto-check -> schedule video KYC -> helper completes KYC -> status updated in DB.

3. Realtime session
   - Client obtains WS token via `ws-token` API -> connects to realtime WS -> authenticates -> receives live events and notifications.

4. Payment flow
   - Web creates Razorpay order -> client completes payment -> webhook validates signature -> payment recorded and receipts issued.

5. Admin operations
   - Admin reviews disputes, triggers payouts, inspects bookingEvents, and runs analytics endpoints.
