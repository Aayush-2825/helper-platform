# Product Requirements Document (PRD)

## Product Name
Helper Platform (Working Name)

## Version
- Version: 1.0
- Date: 2026-03-20
- Document Owner: Product Team
- Stage: MVP Planning

## 1. Product Overview
Helper Platform is a web platform that connects customers with nearby verified helpers (drivers, electricians, plumbers, cleaners, chefs, delivery helpers, caretakers, and security guards).

The core value proposition is speed and trust:
- Customers can book helpers quickly.
- Nearest eligible helper can accept within 10 minutes.
- Pricing is visible and transparent before confirmation.

## 2. Problem Statement
Customers struggle to find reliable local workers for daily tasks due to:
- Limited trusted discovery channels
- Uncertain worker availability
- Opaque and inconsistent pricing
- No unified booking and support system
- Weak worker verification standards

Workers also face inconsistent demand and lack digital identity and trust signals.

## 3. Vision
Provide any type of helper within 10 minutes for any routine task in the city, while creating the fastest, most trusted on-demand workforce platform.

## 4. Goals
### Primary Goals
- Enable helper acceptance within 10 minutes
- Ensure verified worker supply
- Deliver a fast booking flow (less than 2 minutes to request)
- Maintain transparent pricing and payment visibility

### Secondary Goals
- Generate stable local jobs
- Build platform trust through ratings and reviews
- Establish operational control with admin tools and analytics

## 5. User Roles
### Customer
Books helpers, pays for services, and rates completed jobs.

### Helper (Seller)
Accepts jobs, provides services, and receives payouts.

### Admin
Manages users, verifies helpers, monitors bookings, handles disputes, and tracks platform performance.

## 6. Target Market
### Customer Segments
- Busy professionals
- Families
- Elderly users
- Students living independently

### Helper Segments
- Drivers
- Electricians
- Plumbers
- Cleaners
- Chefs
- Delivery helpers
- Caretakers
- Security guards

## 7. Customer Features (MVP)
- OTP-based signup and login
- Automatic location detection with manual override
- Service category and subcategory selection
- Instant booking request creation
- Booking status timeline
- Payment options: UPI, Card, Wallet, Cash
- Ratings and reviews
- Booking history and receipts

## 8. Helper Features (MVP)
- Profile and service management
- KYC and document upload for verification
- Availability toggle (Online/Offline)
- Accept or reject incoming job requests
- Job history and status updates
- Earnings dashboard
- Payout withdrawal to bank account
- Customer ratings visibility

## 9. Admin Features (MVP)
- User and helper management
- Helper verification queue and decisions
- Booking monitoring (live and historical)
- Commission and revenue visibility
- Payment issue handling
- Dispute management workflow
- Core analytics dashboard

## 10. Product Navigation and Page Route Flow (MVP)

The platform should follow a role-first routing model so each user lands in the right workspace with minimal confusion.

### 10.1 Navigation Principles
- Keep public marketing and transactional product routes clearly separated.
- Use `/dashboard` as a post-login role router, then redirect to the correct role portal.
- Keep each role navigation shallow (max 2 levels deep for core actions).
- Ensure primary user tasks are reachable in one click from role home pages.
- Maintain consistent naming: plural nouns for resource lists, verb-noun for actions when needed.

### 10.2 Primary Route Map

#### Public and Entry Routes
- `/` - Marketing homepage and service discovery entry.
- `/organizations` - Organization-facing landing and B2B context.

#### Authentication Routes
- `/auth/signin` - Existing users sign in.
- `/auth/signup` - New account registration.
- `/auth/check-email` - Email verification prompt status.
- `/auth/verify-email` - Email verification completion flow.
- `/auth/forgot-password` - Password reset request.
- `/auth/reset-password` - Password reset completion.
- `/auth/2fa-verify` - Two-factor verification checkpoint.

#### Shared Authenticated Routes
- `/dashboard` - Role-aware redirect and quick access hub.
- `/account/settings` - Cross-role account and security settings.

#### Customer Portal Routes
- `/customer` - Customer home and active booking summary.
- `/customer/book` - New booking flow entry point.
- `/customer/bookings` - Booking history and status timeline.
- `/customer/payments` - Payment methods, invoices, and receipts.
- `/customer/reviews` - Submitted ratings and feedback management.

#### Helper Portal Routes
- `/helper` - Helper home and daily workload summary.
- `/helper/incoming-jobs` - Live incoming requests queue.
- `/helper/availability` - Online/offline and schedule controls.
- `/helper/job-history` - Completed/cancelled jobs history.
- `/helper/earnings` - Earnings, payouts, and reconciliation.
- `/helper/verification` - Verification status and pending actions.

#### Seller Onboarding Routes
- `/seller/onboarding` - Multi-step onboarding wizard.
- `/seller/verification-pending` - Submission confirmation and status.

#### Admin Routes
- `/admin` - Admin command center and global metrics snapshot.
- `/admin/analytics` - KPI, funnel, and operational analytics.
- `/admin/users` - Customer and account management.
- `/admin/helpers` - Helper lifecycle management.
- `/admin/verifications` - KYC verification queue and decisions.
- `/admin/bookings` - Live and historical booking control.
- `/admin/payments` - Payment incidents, refunds, and reconciliation.
- `/admin/disputes` - Dispute triage and resolution workflow.

### 10.3 Professional User Journey Flows

#### Customer Journey (Target)
1. Land on `/` and start from primary CTA.
2. Authenticate via `/auth/signin` or `/auth/signup`.
3. Reach `/dashboard`, then auto-route to `/customer`.
4. Start booking from `/customer/book`.
5. Track progress in `/customer/bookings`.
6. Complete payment from `/customer/payments`.
7. Submit feedback in `/customer/reviews`.

#### Helper Journey (Target)
1. Authenticate via auth routes.
2. Reach `/dashboard`, then auto-route to `/helper`.
3. Set readiness in `/helper/availability`.
4. Accept work in `/helper/incoming-jobs`.
5. Complete jobs and audit history in `/helper/job-history`.
6. Monitor income and payouts in `/helper/earnings`.

#### Seller Onboarding Journey (Target)
1. Start onboarding at `/seller/onboarding`.
2. Submit KYC and payout details.
3. Land on `/seller/verification-pending` after submission.
4. Post-approval, redirect to `/helper` on first login.

#### Admin Journey (Target)
1. Authenticate and route to `/admin`.
2. Monitor platform health in `/admin/analytics`.
3. Handle verification queue at `/admin/verifications`.
4. Resolve incidents via `/admin/disputes` and `/admin/payments`.
5. Manage supply and demand through `/admin/helpers` and `/admin/bookings`.

### 10.4 Route Governance Rules
- Every new route must map to a single owner role: customer, helper, seller, admin, or shared.
- Any multi-step flow must have a clear entry route and completion route.
- Navigation labels and URL paths must remain semantically aligned.
- Empty states should always provide one direct next action route.

## 11. Monetization Model
### Commission
Platform keeps 10% to 25% commission from each booking.

### Premium Helper Plans
Helpers can subscribe for better ranking and visibility.

### Surge Pricing
Dynamic pricing during high demand windows.

### Featured Listings
Helpers can pay for top placement in discovery lists.

## 12. KPIs and Success Metrics
- Daily bookings
- Booking completion rate
- Acceptance rate within 10 minutes
- Average acceptance time
- Average booking value
- Customer repeat rate (30-day)
- Helper weekly active rate
- Cancellation rate (customer/helper)
- Payment success rate
- Average rating and dispute rate

## 13. Functional Requirements
### Authentication
- OTP request and verify flows
- Session management and logout
- Rate limiting and anti-abuse checks

### Booking
- Category-based booking form
- Location and notes capture
- Matching and dispatch to nearest available helpers
- Accept, reject, and timeout states
- Cancellations and status lifecycle

### Payments
- Payment intent creation and confirmation
- Cash tracking for offline mode
- Commission split accounting
- Receipt generation and retrieval

### Ratings and Reviews
- Post-completion rating submission
- Review moderation controls
- Helper quality score contribution

### Disputes
- Dispute creation from booking history
- Admin triage and resolution statuses
- Refund decision path and notes

## 14. Non-Functional Requirements
- Availability: 99.5% monthly uptime target for MVP
- Performance: p95 API response under 500 ms for core endpoints
- Scalability: city-wise expansion without architecture rewrite
- Security: encrypted data in transit and at rest for sensitive fields
- Reliability: retry and fallback handling for notifications/payments
- Observability: logs, metrics, and alerting for core flows
- Usability: mobile-first responsive experience

## 15. Tech Stack (MVP)
- Frontend: Next.js (App Router)
- Backend: Node.js API routes/services
- Database: MongoDB (as proposed in PRD baseline)
- Payments: Razorpay
- Maps/Location: Google Maps API
- Auth: OTP-based login

## 16. Recommended Product Folder Structure

```text
helper-platform/
  apps/
    web/
      src/
        app/
          auth/
          customer/
          helper/
          admin/
          api/
        components/
        features/
          auth/
          booking/
          matching/
          payments/
          reviews/
          disputes/
        lib/
        hooks/
        styles/
      public/
      tests/
      package.json
      next.config.ts
  services/
    matching-service/
      src/
      tests/
      package.json
    payment-service/
      src/
      tests/
      package.json
    notification-service/
      src/
      tests/
      package.json
  packages/
    ui/
      src/
      package.json
    shared/
      auth/
      types/
      utils/
      db/
    config/
      eslint/
      typescript/
  infrastructure/
    docker/
    terraform/
    monitoring/
  docs/
    prd/
    architecture/
    api/
  scripts/
  .github/
    workflows/
  package.json
  README.md
```

## 17. Suggested Structure for Current Repository

```text
src/
  app/
    auth/
    dashboard/
    organizations/
    account/
    api/
  components/
    ui/
  db/
  lib/
    validation/
```

Recommended additions:
- `src/features/booking/`
- `src/features/helper/`
- `src/features/payments/`
- `src/features/reviews/`
- `src/features/disputes/`
- `src/features/admin/`
- `src/services/matching/`
- `src/services/notifications/`

## 18. Milestones
1. Core Auth and Onboarding
- OTP authentication
- Customer/helper profile setup
- Helper verification intake

2. Booking and Assignment
- Booking request creation
- Matching and helper response flow
- Booking lifecycle statuses

3. Payments and Trust
- Razorpay integration
- Ratings and review flow
- Receipts and history

4. Admin and Launch Readiness
- Verification panel
- Basic analytics and monitoring
- SOPs for support and disputes

## 19. Risks and Mitigation
- Supply shortage in peak hours
  - Mitigation: surge incentives and radius expansion

- Low trust due to service inconsistency
  - Mitigation: strict verification and quality scoring

- Payment failures
  - Mitigation: retries, fallback methods, reconciliation checks

- High cancellation rates
  - Mitigation: better matching filters and cancellation policies

## 20. MVP Launch Plan
- Launch in one city first
- Build helper density in selected service clusters
- Track KPI performance for 4 to 8 weeks
- Iterate matching and pricing rules before multi-city expansion

## 21. Future Roadmap
- Mobile apps (Android and iOS)
- AI-based matching and pricing optimization
- Real-time helper tracking
- Subscription plans for customers and helpers
- Emergency fast-response service mode
