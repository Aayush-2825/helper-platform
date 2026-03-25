# Helper Platform PRD vs Codebase Checklist

Date: 2026-03-22
Source baseline: helper-platform.prd.md (root) + current monorepo implementation

## 1) What Is Done

### Product and platform foundation
- [x] Monorepo structure is set up with web app + realtime service + shared packages.
- [x] Typecheck/build/lint scripts are wired at workspace and app levels.
- [x] Realtime service is running with Express + WebSocket server + health routes.
- [x] Realtime event transport supports publish + subscription patterns and typed event categories.

### Authentication and account security
- [x] Better Auth server is integrated with Drizzle adapter.
- [x] Email/password sign-up and sign-in UI exists.
- [x] Password reset request + reset flow exists.
- [x] Two-factor auth (TOTP + backup code) is configured in backend and has UI flows.
- [x] Session handling and role-aware dashboard redirect are implemented.
- [x] Auth rate limiting and CSRF guard are configured.

### Data model readiness
- [x] Core DB schema includes tables/enums for bookings, booking candidates, payments, payouts, disputes, reviews, receipts, helper profile, KYC docs, service categories/subcategories.
- [x] Realtime DB schema includes helper presence, location updates, booking events, incoming jobs, active connections, subscriptions, notification queue.

### Route structure and navigation shells
- [x] PRD-aligned route skeletons exist for customer/helper/admin/seller portals.
- [x] Marketing landing page exists.
- [x] Dashboard role router exists.
- [x] Seller onboarding wizard UI is implemented (multi-step form + validation + local draft save).

## 2) What Is Left (Gaps)

### Critical API gaps (currently placeholders)
- [ ] /api/bookings GET/POST (placeholder responses).
- [ ] /api/payments GET/POST (placeholder responses).
- [ ] /api/reviews GET/POST (placeholder responses).
- [ ] /api/disputes GET/POST/PATCH (placeholder responses).
- [ ] /api/verifications GET/PATCH (placeholder responses).
- [ ] /api/helpers/availability PATCH (placeholder response).
- [ ] /api/admin/analytics GET (placeholder response).

### Core business workflows not implemented end-to-end
- [ ] Customer booking creation with category/subcategory, location, notes, and instant request dispatch.
- [ ] Matching/dispatch engine for nearest eligible helper with 10-minute acceptance window.
- [ ] Helper accept/reject flow tied to real booking records (not simulation).
- [ ] Booking lifecycle state machine enforcement (requested -> matched -> accepted -> in_progress -> completed/cancelled/disputed).
- [ ] Cancellation and timeout handling logic.
- [ ] Payment capture/refund/commission split logic.
- [ ] Receipt generation and retrieval logic.
- [ ] Ratings and reviews submission + moderation + helper score update.
- [ ] Dispute creation + admin resolution workflow.

### Seller/helper operations still partial
- [ ] Seller onboarding backend TODOs: KYC document persistence, payout detail secure storage, verification workflow trigger, confirmation notification.
- [ ] Helper profile/service management CRUD.
- [ ] Helper availability toggle UI + backend persistence.
- [ ] Helper job history and earnings dashboards with real data.
- [ ] Payout withdrawal flow.

### Admin operations still shell-level
- [ ] User management actions (search/filter/suspend).
- [ ] Helper management actions.
- [ ] Verification queue decisioning flow.
- [ ] Booking monitoring with real booking data + controls.
- [ ] Payment issue handling tooling.
- [ ] Dispute triage tooling.
- [ ] KPI analytics queries and dashboard visualizations.

### PRD-specific functional gaps
- [ ] OTP-based signup/login is not implemented as primary auth mode (current flow is email/password + optional social + 2FA).
- [ ] Automatic location detection + manual override for booking not implemented.
- [ ] Payment method UX for UPI/Card/Wallet/Cash not implemented yet (enum exists only).

### NFR and launch-readiness gaps
- [ ] No automated tests found for critical journeys.
- [ ] No structured centralized logging strategy in app layer.
- [ ] No monitoring/alerting/error-tracking integration.
- [ ] No explicit retry/fallback orchestration for payment/notification failures.

## 3) MVP Must-Have Checklist (Prioritized)

### Phase A: Foundation MVP (must complete first)
- [ ] Implement real booking APIs (create/list/detail/update status).
- [ ] Implement matching/dispatch service with timeout and candidate handling.
- [ ] Implement helper availability and incoming job actions (accept/reject/timeout).
- [ ] Connect customer booking page to real API.
- [ ] Connect helper incoming jobs page to real booking records.

### Phase B: Transaction MVP
- [ ] Implement payment flow (intent/order, capture, failure, refund).
- [ ] Implement commission accounting and helper payout ledger.
- [ ] Implement customer payments page and helper earnings page with real data.
- [ ] Implement receipt generation and retrieval.

### Phase C: Trust + Operations MVP
- [ ] Complete seller KYC onboarding backend + verification queue.
- [ ] Implement admin verifications flow (approve/reject/resubmission).
- [ ] Implement reviews and disputes flows.
- [ ] Implement admin bookings/users/helpers/payments/disputes pages with real controls.
- [ ] Implement core analytics endpoint + dashboard KPIs from PRD.

### Phase D: MVP hardening (required before launch)
- [ ] Add integration tests for auth, booking, matching, payments, disputes.
- [ ] Add structured logging + error tracking + dashboards/alerts.
- [ ] Add production-grade validation and consistent API error contracts.
- [ ] Validate security posture (rate limits across write endpoints, secrets, cookies, CSRF, authz checks).

## 4) Current Readiness Snapshot
- Architecture readiness: High
- Data model readiness: High
- Auth/security baseline readiness: Medium-High
- Business feature completeness (customer/helper/admin): Low
- End-to-end MVP readiness: Low

## 5) Suggested Immediate Next 10 Tasks
- [ ] Build /api/bookings POST with schema validation.
- [ ] Build /api/bookings GET (customer/helper scoped).
- [ ] Build candidate matching selection logic and bookingCandidate writes.
- [ ] Add helper accept/reject endpoint.
- [ ] Wire helper incoming-jobs UI to new accept/reject endpoint.
- [ ] Wire customer book form UI to booking create endpoint.
- [ ] Implement /api/helpers/availability PATCH and connect helper availability page.
- [ ] Integrate payment provider sandbox and implement /api/payments POST.
- [ ] Complete seller onboarding TODOs in /api/sellers/onboarding.
- [ ] Implement /api/verifications GET/PATCH and connect admin verifications page.
