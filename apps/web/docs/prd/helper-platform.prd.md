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
- Real-time booking status timeline and live map tracking
- Secure job completion via OTP verification
- Payment options: UPI, Card, Wallet, Cash
- Ratings and reviews
- Booking history and receipts

## 8. Helper Features (MVP)
- Profile and service management
- Video KYC (OAuth-based) and document upload for verification
- Availability toggle (Online/Offline)
- Accept or reject incoming job requests
- Live location tracking during active jobs
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

#### Customer Portal Routes (`/(portal)/customer`)
- `/customer` - Customer home and active booking summary.
- `/customer/book` - New booking flow entry point.
- `/customer/active` - Live tracking and status of the active job.
- `/customer/bookings` - Booking history and status timeline.
- `/customer/payments` - Payment methods, invoices, and receipts.
- `/customer/reviews` - Submitted ratings and feedback management.

#### Helper Portal Routes (`/(portal)/helper`)
- `/helper` - Helper home and daily workload summary.
- `/helper/incoming-jobs` - Live incoming requests queue with map tracking.
- `/helper/active` - Active job tracking and status updates.
- `/helper/availability` - Online/offline and schedule controls.
- `/helper/job-history` - Completed/cancelled jobs history.
- `/helper/earnings` - Earnings, payouts, and reconciliation.
- `/helper/verification` - Verification status and pending actions.
- `/helper/video-kyc` - Video KYC scheduling and verification via OAuth.

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

### 10.5 Responsive Design Specification

This PRD-level responsive spec is distilled from the completed UX audit in [apps/web/docs/prd/dozo-ux-ui-deliverables.md](dozo-ux-ui-deliverables.md). Use that document for the full page-by-page breakdown; this section defines the behavioral rules the product should follow across breakpoints.

#### Breakpoint intent

| Breakpoint | Range | Layout intent |
|---|---|---|
| Mobile | 375-428px | Single-column, bottom-nav-first, action-led layout with stacked cards and minimal horizontal scanning. |
| Tablet | 768-1024px | Transitional layout with denser cards, selective two-column regions, and filters or secondary controls moved into compact rails or sheets. |
| Laptop | 1280-1440px | Primary desktop workspace with sidebar navigation, stronger information density, and master-detail or split-panel patterns where helpful. |
| Desktop | 1440px and up | Maximum workspace density, persistent side navigation, richer summary rails, and wider tables or dual-pane operations views. |

#### Page-type behavior by breakpoint

| Page type | Mobile | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| Dashboard | Use the bottom nav plus a sticky top header, stack all sections vertically, and prioritize one primary action per card. | Shift to a two-column card grid where the second column is supportive rather than competing with the main task. | Move to the full portal shell with sidebar navigation and visible breadcrumbs; keep the most important metric or action above the fold. | Increase the density of summary rails, shortcuts, and supporting context without introducing new navigation depth. |
| List / table | Convert tables into card rows or compact accordions, keep filters simple, and avoid inline column overload. | Allow denser cards or partial tables, with filters grouped into a single compact row or sheet. | Render full tables with sticky headers, row actions, and optional side detail panels. | Preserve the desktop table shape but make it wider and easier to scan with stronger grouping and secondary metadata. |
| Detail view | Stack timeline, status, map, and actions in a strict reading order; keep the primary CTA visible and reachable. | Use a split layout only when the content is stable enough; otherwise keep the stacked flow. | Prefer master-detail or a content-plus-rail layout, especially for booking, verification, and admin case views. | Expand the detail surface with richer context, but keep actions near the primary evidence or timeline. |
| Form / wizard | Use one column, large fields, clear step language, and 44px+ touch targets. | Allow two-column layout only for low-risk inputs; keep step navigation obvious. | Use a centered or split form with contextual help, draft state, and explicit save/continue actions. | Keep the same structure as laptop, but increase the room for help text, summaries, and confirmation. |

#### Interaction rules

- Touch targets should remain at least 44px high on mobile and tablet, including nav items, list rows, icon buttons, and destructive controls.
- Mobile interactions should support tap-first use; do not rely on hover, fine pointer precision, or multi-step hover previews.
- Gesture expectations on mobile should stay simple: tap to navigate, tap-and-hold only when absolutely necessary, and no hidden swipe-only actions for core tasks.
- Laptop and desktop interactions may use hover to reveal secondary context, but hover should never be the only way to discover a primary action.
- Maps, tables, and dense lists should reserve space to avoid layout shift, especially on booking, earnings, and admin audit screens.

#### Breakpoint-specific visual priority

- Consumer screens should preserve calm spacing and discovery-led hierarchy at every breakpoint.
- Helper screens should remain operational and status-forward, with live states easy to scan quickly on smaller screens.
- Admin screens should preserve dense, precise information hierarchy, but collapse gracefully into cards or split panes on smaller widths.

### 10.6 Design Patterns

The design patterns below are the recurring UI rules the product should follow across portals. They are grounded in the current codebase and in the completed UX audit in [apps/web/docs/prd/dozo-ux-ui-deliverables.md](dozo-ux-ui-deliverables.md). Where a pattern varies by portal, the variation should reinforce the portal motif rather than introduce a new visual language.

#### Navigation patterns

| Pattern | Shared rule | Portal-specific variation |
|---|---|---|
| Auth navigation | Keep auth as a single shared entry point with role-aware redirects after sign-in. | None; auth remains shared across all roles. |
| Primary portal navigation | Use sidebar navigation on laptop/desktop and bottom navigation on mobile for consumer and helper. | Admin should remain sidebar-first and should not gain a mobile bottom nav unless the admin shell is reworked. |
| Page-level context | Keep the current page title, breadcrumb, and active nav state visible so users know where they are. | Consumer should feel lighter and more exploratory; helper should feel more operational; admin should feel denser and more analytical. |

#### Status and badge conventions

| Pattern | Shared rule | Portal-specific variation |
|---|---|---|
| State labels | Pair color with text, icon, or short copy so status is never color-only. | Consumer statuses should feel reassuring, helper statuses should feel operational, and admin statuses should feel diagnostic. |
| Progress and approval | Use clear pending / approved / rejected / resubmission states where verification or compliance is involved. | Helper and admin should surface these states most prominently; customer screens should use simpler progress language. |
| Urgency | Reserve destructive or warning colors for genuine exceptions, failures, or blocking states. | Admin can use the most dense exception language; helper can use stronger live-state contrast; consumer should keep urgency softer unless the action is truly blocking. |

#### Loading, empty, and error patterns

| Pattern | Shared rule | Portal-specific variation |
|---|---|---|
| Loading | Prefer skeletons for content-rich views and short inline loading labels for narrow screens or small async actions. | Consumer loading should feel calm, helper loading should feel live and active, and admin loading should feel precise and data-driven. |
| Empty | Always show one clear next action or recovery path. | Consumer empty states should guide discovery, helper empty states should guide availability or queue readiness, and admin empty states should guide filter reset or refresh. |
| Error | Show the error in place, with a retry or escape route; do not fail silently. | Helper and admin should expose the retry path more aggressively because they operate on live data and operational workflows. |

#### Live-update patterns

| Pattern | Shared rule | Portal-specific variation |
|---|---|---|
| Realtime data | Use websocket-driven or realtime-fed updates where the UI implies live work, presence, or status changes. | Helper should use the most live behavior for presence, queue, and booking state; admin should use live updates selectively for ops visibility; consumer can stay mostly event-driven around booking and payment updates. |
| Static data | Keep static or slowly changing data cached and refreshable rather than constantly streaming. | Consumer reviews and helper onboarding details can stay more static than active jobs or booking status. |
| Refresh semantics | Provide explicit refresh or reconnect affordances for live screens. | Helper and admin should show connection state more visibly than consumer. |

#### Form and confirmation patterns

| Pattern | Shared rule | Portal-specific variation |
|---|---|---|
| Forms | Use labeled fields, inline validation, and clear primary/secondary actions. | Consumer forms should favor simplicity; helper forms can be slightly denser; admin forms can be the most dense but should still avoid hidden controls. |
| Confirmation | Require confirmation for actions that change money, access, approval state, or irreversible workflow state. | Helper payouts, admin status transitions, and destructive booking actions should all ask for an explicit confirm step. |
| Drafting | Preserve progress where a flow is multi-step or high-friction. | Helper onboarding and video KYC scheduling should keep drafts or recoverable state; consumer booking can preserve partial form state; admin case work can keep selected record context. |

#### Destructive-action patterns

| Pattern | Shared rule | Portal-specific variation |
|---|---|---|
| Destructive actions | Use obvious destructive styling, a warning message, and a confirmation step; do not rely on icon color alone. | Helper destructive actions should mostly be limited to cancellation or profile actions; admin destructive actions should be the most explicit because they affect platform state; consumer destructive actions should be the softest unless they affect payment or booking cancellation. |
| Recovery | Always offer a safe escape route after a destructive or high-risk action. | Helper and admin should return users to the underlying record or queue after success; consumer should return users to the booking or payment detail. |
| Blocking constraints | If a backend constraint is known, surface it as an explicit product limitation rather than a broken button. | The inline matching workflow, third-party QR generation, and encryption fallback are confirmed constraints and should be treated as product dependencies, not hidden implementation details. |

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
- Progressive matching and dispatch to nearest available helpers (expanding search radius: 5km, 10km, 20km, 50km)
- Accept, reject, and timeout states
- Cancellations and status lifecycle (including on-disconnect cancellation)
- Secure job completion verified via Customer OTP

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
- Frontend: Next.js (App Router), Tailwind CSS 4.0, Shadcn UI
- Backend: Node.js API routes/services
- Database: PostgreSQL (Neon) with Drizzle ORM
- Payments: Razorpay
- Maps/Location: MapLibre GL
- Auth: Better Auth (OTP and OAuth support)

## 16. Current Monorepo Structure

```text
helper-platform/
  apps/
    web/
      src/
        app/
          (auth)/
          (marketing)/
          (portal)/
            admin/
            customer/
            dashboard/
            helper/
            organizations/
          api/
        components/
        features/
        hooks/
        lib/
      package.json
  packages/
    db/
      src/
        schema/
      package.json
    ui/
      src/
        components/
      package.json
    shared/
    config/
  package.json
```

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
- Subscription plans for customers and helpers
- Emergency fast-response service mode
