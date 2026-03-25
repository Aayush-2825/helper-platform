# Helper Platform MVP Sprint Plan

Date: 2026-03-22
Planning model: 4 sprints x 2 weeks (8 weeks total)
Input: PRD + current implementation audit + MVP_CHECKLIST.md

## Team Lanes (Suggested)

- Backend lane: APIs, domain services, DB transactions, authz, integrations
- Frontend lane: portal pages, forms, data states, realtime UX
- Realtime lane: websocket events, subscriptions, matching-trigger events
- QA lane: test plans, regression, end-to-end scenarios, release checks

## Sprint 1 (Weeks 1-2): Booking Foundation

### Objective
Deliver first real booking flow from customer request to helper candidate generation.

### Scope
- Implement booking create/list endpoints.
- Implement helper availability endpoint.
- Implement matching v1 (nearest eligible helper, simple radius + category fit).
- Connect customer book page and helper availability page to real APIs.

### Stories and Tasks

1. Booking API v1
- Owner: Backend
- Tasks:
  - Add POST /api/bookings with zod validation and auth guards.
  - Add GET /api/bookings scoped by role (customer/helper/admin).
  - Persist booking + bookingCandidate records.
  - Add status transitions: requested -> matched.
- Dependencies: Existing schema tables ready.
- Acceptance:
  - Customer can create a booking successfully.
  - API rejects invalid payloads with structured errors.
  - GET returns role-filtered booking list.

2. Helper availability API
- Owner: Backend + Frontend
- Tasks:
  - Implement PATCH /api/helpers/availability.
  - Connect helper availability UI toggle to endpoint.
  - Publish helper presence event via realtime ops endpoint.
- Dependencies: helperProfile + realtime helper_presence.
- Acceptance:
  - Helper online/offline updates are persisted and visible in DB.
  - Realtime event published on state change.

3. Matching service v1
- Owner: Backend + Realtime
- Tasks:
  - Build matching function using category, city, availability, service radius.
  - Create candidate rows with expiresAt (10-minute window).
  - Emit booking_request realtime event to candidate helpers.
- Dependencies: booking create endpoint.
- Acceptance:
  - At least one eligible helper candidate receives booking_request event.
  - Candidate expiry set and queryable.

4. Customer booking form hookup
- Owner: Frontend
- Tasks:
  - Build real form in /customer/book.
  - Fields: category/subcategory, location text, notes, preferred schedule.
  - Call POST /api/bookings and show confirmation state.
- Dependencies: Booking API v1.
- Acceptance:
  - Form submits and creates booking from UI.

### Sprint 1 Demo
- Customer creates booking.
- Helper marked online appears as candidate.
- Helper receives booking_request event in incoming jobs feed.

### Sprint 1 Risks
- Matching quality may be basic initially.
- Location handling starts manual first, geolocation can be added in Sprint 2.

## Sprint 2 (Weeks 3-4): Helper Actions + Booking Lifecycle

### Objective
Deliver helper accept/reject flow and visible booking lifecycle for customer and admin.

### Scope
- Implement helper response endpoints.
- Enforce lifecycle transitions and timeout rules.
- Upgrade customer bookings and helper incoming jobs pages to real data.
- Add admin bookings list with filters.

### Stories and Tasks

1. Helper response endpoints
- Owner: Backend
- Tasks:
  - Add POST /api/bookings/:id/accept.
  - Add POST /api/bookings/:id/reject.
  - Resolve competing candidates atomically.
- Dependencies: bookingCandidate table.
- Acceptance:
  - First valid accept wins.
  - Booking status updates to accepted.
  - Other candidates are closed as rejected/timeout.

2. Timeout and cancellation handling
- Owner: Backend
- Tasks:
  - Add timeout processor for expired candidates.
  - Add booking cancellation endpoint with actor tracking.
  - Emit booking_update events.
- Dependencies: candidate expiresAt.
- Acceptance:
  - Expired request transitions cleanly.
  - Cancellation actor is recorded.

3. Helper incoming jobs real UI
- Owner: Frontend
- Tasks:
  - Replace simulation-first view with real pending jobs list.
  - Add accept/reject buttons.
  - Show countdown until timeout.
- Dependencies: helper response endpoints.
- Acceptance:
  - Helper can respond from UI and see result state.

4. Customer bookings timeline
- Owner: Frontend
- Tasks:
  - Fetch booking list and details from API.
  - Merge realtime updates into timeline.
  - Add cancel action where allowed.
- Dependencies: lifecycle endpoints.
- Acceptance:
  - Customer sees booking progress and timestamps.

5. Admin bookings operations
- Owner: Frontend + Backend
- Tasks:
  - Build list/filter endpoint for admin booking monitoring.
  - Add admin bookings controls (view details, cancel where policy allows).
- Dependencies: booking APIs.
- Acceptance:
  - Admin can monitor and intervene on bookings.

### Sprint 2 Demo
- Helper accepts job from incoming jobs.
- Customer sees accepted state update live.
- Admin sees booking reflected in monitoring list.

### Sprint 2 Risks
- Concurrency bugs on accept path.
- Realtime ordering consistency across multiple clients.

## Sprint 3 (Weeks 5-6): Payments, Reviews, Disputes, Verification

### Objective
Deliver trust and transaction loops to complete core PRD MVP workflows.

### Scope
- Implement payments and receipts.
- Implement reviews and disputes APIs + UI.
- Complete seller onboarding backend TODOs.
- Implement admin verification queue.

### Stories and Tasks

1. Payments v1
- Owner: Backend
- Tasks:
  - Implement POST /api/payments for payment intent/order creation.
  - Add payment status updates and booking linkage.
  - Compute commission and helper net values.
  - Create receipt records.
- Dependencies: booking accepted/completed lifecycle.
- Acceptance:
  - Payment record created and status reflected in booking/payment pages.
  - Commission amount stored.

2. Customer and helper payment surfaces
- Owner: Frontend
- Tasks:
  - Build /customer/payments history + receipt links.
  - Build /helper/earnings summary + payout history.
- Dependencies: payments API.
- Acceptance:
  - Real transaction data shown for both roles.

3. Reviews
- Owner: Backend + Frontend
- Tasks:
  - Implement GET/POST /api/reviews.
  - Add customer rating form post-completion.
  - Show helper ratings visibility.
- Dependencies: completed bookings.
- Acceptance:
  - Only completed booking can be reviewed.
  - Review appears in history.

4. Disputes
- Owner: Backend + Frontend
- Tasks:
  - Implement GET/POST/PATCH /api/disputes.
  - Build customer/helper dispute create flow.
  - Build admin dispute resolution actions.
- Dependencies: payments + bookings.
- Acceptance:
  - Dispute can be created and resolved with tracked status.

5. Seller onboarding completion + verification queue
- Owner: Backend + Frontend
- Tasks:
  - Complete TODOs in /api/sellers/onboarding (KYC docs, payout details security, trigger verification workflow).
  - Implement /api/verifications GET/PATCH.
  - Build admin verification queue screen.
- Dependencies: onboarding wizard already exists.
- Acceptance:
  - New onboarding submission appears in admin verification queue.
  - Admin approve/reject updates helper verification state.

### Sprint 3 Demo
- Accepted booking proceeds to payment and receipt.
- Customer leaves review.
- Dispute is raised and resolved by admin.
- Seller KYC submission is approved in admin queue.

### Sprint 3 Risks
- External payment integration delays.
- Security requirements for payout/bank detail storage.

## Sprint 4 (Weeks 7-8): Analytics + Hardening + Launch Gate

### Objective
Reach MVP release quality and validate PRD success metrics visibility.

### Scope
- Build core admin analytics endpoint and dashboard.
- Add observability and error tracking.
- Add integration tests and UAT checklist.
- Conduct performance and security hardening passes.

### Stories and Tasks

1. Analytics
- Owner: Backend + Frontend
- Tasks:
  - Implement /api/admin/analytics with KPI aggregates.
  - Build /admin/analytics cards/charts for core PRD metrics.
- Dependencies: bookings/payments/reviews/disputes data available.
- Acceptance:
  - Dashboard shows daily bookings, completion rate, acceptance time, cancellation rate, payment success.

2. Observability and error handling
- Owner: Backend + Realtime
- Tasks:
  - Introduce structured logger and request correlation IDs.
  - Add centralized error response format.
  - Add error tracking integration.
- Dependencies: none.
- Acceptance:
  - Errors are visible with enough context to debug.

3. Testing and QA
- Owner: QA + Backend + Frontend
- Tasks:
  - Add integration tests for booking, accept/reject, payment, reviews, disputes.
  - Add smoke test checklist for all role journeys.
  - Regression test auth + role routing + critical APIs.
- Dependencies: core features complete.
- Acceptance:
  - Test suite covers critical path and passes in CI.

4. Performance and security validation
- Owner: Backend + Realtime + QA
- Tasks:
  - Load test booking create + matching + realtime fanout.
  - Validate authz checks on all role-protected endpoints.
  - Verify rate limits on write-heavy endpoints.
- Dependencies: near-final feature set.
- Acceptance:
  - No critical security findings.
  - p95 targets validated for core endpoints.

### Sprint 4 Demo
- End-to-end customer/helper/admin scenario runs in stable environment.
- Admin analytics reflects live metrics.
- Release checklist sign-off complete.

## Cross-Sprint Definition of Done

A story is done only if all are true:
- Code merged with typecheck/lint passing.
- Happy path + error path handled.
- Authz and validation applied.
- Realtime events emitted where required.
- Basic tests added or updated.
- Documentation updated if API/flow changed.

## Dependency Map (High Level)

1. Booking APIs -> Matching -> Helper accept/reject -> Payment flow
2. Payment flow -> Receipts -> Earnings/commissions
3. Completed bookings -> Reviews + Disputes
4. Seller onboarding completion -> Admin verification workflow
5. All core data -> Admin analytics KPIs

## Suggested Ownership Matrix

- Backend lead: booking lifecycle, matching orchestration, payments, disputes, verifications
- Frontend lead: customer/helper/admin pages and UX states
- Realtime lead: event contracts, subscriptions, reliability
- QA lead: automation, regression pack, launch criteria

## Launch Gate Checklist (Go/No-Go)

- [ ] Customer can book and track status end-to-end.
- [ ] Helper can go online, receive job, accept/reject, complete job.
- [ ] Payment and receipt flow works for successful and failed scenarios.
- [ ] Admin can verify helpers, monitor bookings, resolve disputes.
- [ ] Core analytics KPIs visible and accurate.
- [ ] Critical tests pass and no blocker defects remain.
- [ ] Observability and security checks complete.
