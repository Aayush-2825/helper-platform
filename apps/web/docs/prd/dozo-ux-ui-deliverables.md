# DOZO UX/UI Flow and Page-Level Redesign

Version: 1.0
Date: 2026-08-04
Scope: Consumer, Helper, and Admin portals in `apps/web`

Grounding note: This document reuses the completed audit as source of truth. It only extrapolates in the Future Features, Route-by-Route Implementation Plan, and Figma-style Screen Inventory sections, and those extrapolations are called out explicitly. The PRD now includes condensed responsive and design-pattern summaries derived from this audit; this file remains the deeper reference.

## 1. Executive Summary

DOZO already has the right structural primitives: one unified auth system, one role router, one shared dashboard shell, and one shared booking detail controller. The current opportunity is not to redesign the app into a different architecture, but to make the current architecture legible, faster to navigate, and less duplicative.

The current product shape is:
- Unified auth at `/auth/signin` and `/auth/signup`.
- Role-based landing via `/dashboard` to `/customer`, `/helper`, or `/admin`.
- Shared shell patterns through `DashboardLayout`, `Navbar`, and `BottomNav`.
- Shared booking detail logic through `BookingDetails`.

The main UX issues are:
- Several routes are redirect-only or thin wrappers, so they create extra clicks without adding information.
- Helper onboarding and verification are real product flows, but they are not surfaced early enough in the journey.
- Customer, helper, and admin portals are visually and behaviorally different, but they still share enough primitives that the design system should present them as three moods of one product.
- A few flows are constrained by backend choices, so the UI plan must respect those constraints instead of pretending they do not exist.

Known issues and technical debt are consolidated in Section 11.

## 2. Auth & Onboarding Flow

### Current state

The app already uses a single authentication surface for all roles. That is the right default. Users sign in once, then role-based session logic routes them into the correct portal.

The current auth and onboarding sequence is:
1. Sign in or sign up on the shared auth pages.
2. Verify email if required.
3. Handle password reset if needed.
4. Handle 2FA challenge when the account has 2FA enabled.
5. Redirect through `/dashboard` to the correct portal home.
6. For helpers, continue into onboarding, verification, and video KYC if the account is not yet approved.

### Target state

Keep the auth entry points unified. Do not split into separate customer/helper/admin login pages. Instead, make the account state clear after sign-up and after sign-in:
- Customer accounts should reach the customer portal immediately after onboarding and verification obligations are satisfied.
- Helper accounts should be guided into onboarding and verification before they are treated like live workers.
- Admin accounts should land directly in the admin portal, but still see 2FA and account security states clearly.

### UX priorities

- Reduce uncertainty on the auth pages by showing what happens after sign-up.
- Make the helper path explicit earlier in the journey so users do not discover the verification funnel only after login.
- Treat 2FA as part of the sign-in story, not as a settings-only feature.
- Keep password recovery and email verification simple and low-friction.

### Recommended flow interpretation

- Customer: sign up -> verify email -> land in customer portal.
- Helper: sign up -> choose helper intent -> onboarding -> verification pending -> video KYC -> helper portal.
- Admin: sign in -> 2FA if enabled -> admin portal.

This is a product recommendation based on the current codebase shape; the account creation backend remains unified.

## 3. Sitemap Per Portal

### 3.1 Consumer Portal

| Route | Status | Purpose |
|---|---|---|
| `/customer` | Keep | Customer home, active work, discovery, wallet, and support shortcuts. |
| `/customer/book` | Keep | Start a new booking from map and service selection. |
| `/customer/active` | Merge/remove | Redirect-only active booking shortcut. |
| `/customer/bookings` | Keep | Booking history, live updates, and active/past separation. |
| `/customer/bookings/[id]` | Keep | Shared booking detail and action surface. |
| `/customer/payments` | Keep | Payment history, receipts, and payment completion. |
| `/customer/reviews` | Keep | Review submission and review history. |
| `/customer/helper/[id]` | Replace | Hardcoded helper profile placeholder; should become a real profile route or be removed. |

### 3.2 Helper Portal

| Route | Status | Purpose |
|---|---|---|
| `/helper` | Keep | Helper home, availability, incoming work, earnings, and shortcuts. |
| `/helper/availability` | Keep | Online/offline/busy state and availability slots. |
| `/helper/active` | Merge/remove | Redirect-only active job shortcut. |
| `/helper/incoming-jobs` | Keep | Live queue and location radar. |
| `/helper/job-history` | Keep | Active and past jobs history. |
| `/helper/earnings` | Keep | Earnings, payouts, and reconciliation. |
| `/helper/verification` | Keep | Verification status and next actions. |
| `/helper/video-kyc` | Keep | Schedule or manage video KYC. |
| `/helper/video-kyc/join` | Keep | Join-time gate for the video KYC session. |
| `/helper/onboarding` | Keep | Helper onboarding wizard. |
| `/helper/verification-pending` | Keep | Post-submit pending state. |
| `/helper/bookings/[id]` | Keep | Shared booking detail and helper action surface. |

### 3.3 Admin Portal

| Route | Status | Purpose |
|---|---|---|
| `/admin` | Keep | Admin overview and operational snapshot. |
| `/admin/users` | Keep | User directory and account actions. |
| `/admin/helpers` | Keep | Helper network operations. |
| `/admin/verifications` | Keep | Document queue and video KYC operations. |
| `/admin/bookings` | Keep | Booking operations and monitoring. |
| `/admin/payments` | Keep | Payment audit and revenue controls. |
| `/admin/disputes` | Keep | Dispute triage and resolution. |
| `/admin/payouts` | Keep | Payout operations and settlement control. |
| `/admin/analytics` | Keep | KPI and trend dashboard. |

## 4. Page-By-Page Spec

### 4.1 Consumer Portal

| Route | Page intent | Default state | Loading state | Empty state | Error state |
|---|---|---|---|---|---|
| `/customer` | Return the customer to the next useful action quickly. | Greeting, active booking card, rebook tiles, wallet summary, recent history, help CTA. | Skeleton cards and placeholders in the main grid. | First-booking encouragement and category shortcuts. | Retry banner with clear refresh action. |
| `/customer/book` | Start a booking from service discovery and location. | Map-led booking surface with service selection and contextual guidance. | Map and booking panel skeletons. | No service chosen, show service discovery guidance. | Invalid-service or map-loading failure with retry guidance. |
| `/customer/active` | Shortcut to the active booking. | Redirects to the active booking detail if one exists. | One compact loading card if redirect is delayed. | No active booking empty card. | Redirect fallback and retry CTA. |
| `/customer/bookings` | Review active and historical bookings. | Active and past sections with realtime updates, status chips, and journey summaries. | List skeletons and subdued status placeholders. | No active or past bookings copy with a strong booking CTA. | Fetch failure banner with retry. |
| `/customer/bookings/[id]` | Track one booking and act on it. | Status header, timeline, map, helper/customer context, payment and action area. | Detail skeleton, map placeholder, and action disabled states. | Booking not found or unavailable. | Error state with back and retry actions. |
| `/customer/payments` | See what was paid, what is pending, and what can be downloaded. | Summary cards, transaction list, due banner, receipt actions. | Receipt/list skeletons. | No payments or no receipts copy. | Payment fetch or checkout error banner. |
| `/customer/reviews` | Submit and review post-completion feedback. | Completed booking cards with stars, comments, and submitted state. | Card skeletons. | No completed bookings guidance. | Submit failure banner and retry. |
| `/customer/helper/[id]` | Inspect a helper before booking. | Profile header, services, ratings, reviews, sticky Book Now CTA. | Profile skeletons. | Missing helper profile fallback. | Lookup failure with back navigation. |

### 4.2 Helper Portal

| Route | Page intent | Default state | Loading state | Empty state | Error state |
|---|---|---|---|---|---|
| `/helper` | Give the helper a live work dashboard. | Availability toggle, incoming work preview, active task, earnings summary, quick actions. | Card skeletons and disabled controls. | No jobs or no earnings guidance. | Reconnect or refresh banner. |
| `/helper/availability` | Manage working hours and live availability. | Online/offline/busy state, slot editor, save action. | Slot skeletons and disabled actions. | No slots yet guidance. | Validation or save error state. |
| `/helper/active` | Shortcut to the current active job. | Redirects to the active booking detail if one exists. | Compact loading card if needed. | No active job empty state. | Redirect fallback and retry action. |
| `/helper/incoming-jobs` | Act on live incoming requests. | Queue, map, current job panel, accept/reject actions. | Queue skeleton and map placeholder. | No incoming requests state. | WebSocket disconnect or fetch error. |
| `/helper/job-history` | Inspect active and past work. | Journey summary, active jobs, past jobs, realtime refresh. | List skeletons. | No completed jobs guidance. | Fetch error banner and refresh. |
| `/helper/earnings` | Understand earnings and request payout. | Gross/net cards, pending balances, payout form, payout history. | Summary and table skeletons. | No payout history or zero balance state. | Load or payout request error. |
| `/helper/verification` | Track verification state and next step. | Pending, approved, rejected, or resubmission state with clear next actions. | Polling state and status skeleton. | Rarely empty; treat as a loading or pending problem instead. | Verification fetch error and retry guidance. |
| `/helper/video-kyc` | Schedule or manage video KYC. | Slot picker, current appointment card, reschedule/cancel controls. | Slot and appointment skeletons. | No slots or no appointment guidance. | Scheduling error banner. |
| `/helper/video-kyc/join` | Gate access to the live video KYC call. | Join-ready or too-early guidance with one primary action. | Compact loading card. | No session or expired session state. | Join failure or missing session error. |
| `/helper/onboarding` | Capture the helper application and profile draft. | Multi-step onboarding wizard and draft recovery. | Step skeleton and draft loading state. | Empty step guidance if a section is not yet filled. | Submit or persistence error. |
| `/helper/verification-pending` | Reassure the helper after onboarding submission. | Success or under-review timeline, application ID, next-step guidance. | If needed, a small pending skeleton only. | No submission data fallback. | Rarely error-driven; show the application ID lookup failure if needed. |
| `/helper/bookings/[id]` | Execute one assigned job. | Shared booking detail with helper-specific actions, OTP, and status controls. | Detail skeleton and map placeholder. | Booking not found or unavailable. | Error banner and retry. |

### 4.3 Admin Portal

| Route | Page intent | Default state | Loading state | Empty state | Error state |
|---|---|---|---|---|---|
| `/admin` | Give operations a platform snapshot. | KPI cards, financial overview, quick access, core operations grid. | Metric skeletons. | No data or partial-data state. | Dashboard fetch error with retry. |
| `/admin/users` | Search and manage accounts. | Search, filters, user table, row actions. | Table skeletons. | No filtered results state. | List or mutation error. |
| `/admin/helpers` | Manage helper lifecycle and visibility. | Search, filters, helper table, row actions, confirmations. | Table skeletons. | No matching helpers. | Mutation or fetch error. |
| `/admin/verifications` | Review documents and video KYC from one queue. | Metrics, tabs, document queue, detail pane, video KYC controls, calendar state. | Queue and detail skeletons. | No pending verifications. | Review or scheduling error. |
| `/admin/bookings` | Monitor booking operations. | Metrics, filters, booking table, live status cues. | Table and metric skeletons. | No matching bookings. | Realtime disconnect or fetch error. |
| `/admin/payments` | Audit payment activity. | Search, filters, payment table, copy actions. | Table skeletons. | No matching payments. | Fetch or copy failure. |
| `/admin/disputes` | Resolve disputes. | Summary cards, filters, dispute list, detail panel, resolution form. | List and form skeletons. | No disputes in scope. | Save or fetch error. |
| `/admin/payouts` | Operate helper payouts and settlement. | Filters, payout table, row actions. | Table skeletons. | No matching payouts. | Mutation or fetch error. |
| `/admin/analytics` | Monitor marketplace health. | KPI cards, sparklines, bar charts, breakdowns. | Chart and card skeletons. | No analytic data available. | Analytics fetch error. |

## 5. Merge / Remove List

### Merge or remove now

- `/customer/active` should merge into `/customer/bookings/[id]` or the `/customer` active-booking card. It does not add unique information.
- `/helper/active` should merge into `/helper/bookings/[id]` or the `/helper` active-task card. It is a redirect-only affordance.
- `/customer/helper/[id]` should be replaced with real, data-backed helper profile content. The current page is hardcoded and therefore not trustworthy as a product surface.

### Keep, but simplify the emphasis

- `/customer/bookings` should remain the canonical customer history surface.
- `/helper/job-history` should remain the canonical helper history surface.
- `/admin/verifications` should remain the combined document and video-KYC review surface rather than splitting into separate admin flows.
- `/dashboard` should remain a router only, not a destination screen.

## 6. Future Features

These are independently derived recommendations, not a checklist copied from the current repo.

### Consumer

- Real helper profile pages with service area, response time, ratings, and availability context.
- Saved addresses and repeat-booking shortcuts.
- Booking help or dispute thread attached to each booking.
- Favorite helpers or preferred helper lists.

### Helper

- Calendar-based availability view.
- Certifications and document center.
- Service radius or work-zone editing.
- Earnings export and period filters.

### Admin

- Service catalog and pricing management.
- Broadcast announcement center for operational notices.
- Role and permission management for admin sub-roles.
- Content and theme management for marketing and support surfaces.

## 7. Responsive Reference Sheet

PRD cross-reference: the PRD now carries a condensed version of this guidance in Section 10.5 of [helper-platform.prd.md](helper-platform.prd.md). Keep this section as the detailed source.

| Pattern | Mobile | Tablet | Laptop/Desktop |
|---|---|---|---|
| Dashboard home | Single column, bottom nav, stacked cards, sticky top bar. | Two-column grid where safe. | Multi-column shell with sidebar and richer secondary rails. |
| List or table | Cardified rows or compact accordions. | Dense cards or partial tables. | Full tables with sticky headers and inline actions. |
| Detail view | Sequential sections, large CTAs, map above or below narrative. | Split layout where the content risk is low. | Master-detail or split content plus right rail. |
| Form or wizard | One column, large inputs, 44px+ touch targets. | Two columns only for low-risk inputs. | Centered form with contextual help rail. |

Rules:
- Keep live updates explicit. Do not hide refresh or loading behavior.
- Treat status with both color and text.
- Reserve space for maps, charts, and live tables to reduce layout shift.
- Make destructive actions visually distinct and confirm them.

## 8. Design System Notes

PRD cross-reference: the PRD now carries a condensed design-pattern summary in Section 10.6 of [helper-platform.prd.md](helper-platform.prd.md). Keep this section as the deeper portal-motif reference.

The repo already uses shared UI primitives from `@repo/ui`, and the shell styling is centralized rather than bespoke per page. This is the right foundation. The redesign should add portal-specific mood and hierarchy without fragmenting the component system.

### Consumer motif

- Tone: calm, discovery-led, reassuring.
- Color direction: soft neutrals with sea-glass or teal accents, plus warm success accents.
- Imagery: lifestyle-forward, service discovery, light map cues, and friendly trust markers.
- Iconography: rounded line icons, minimal harsh geometry.

### Helper motif

- Tone: operational, high-trust, fast-moving.
- Color direction: deeper slate or navy base with energetic green, amber, and alert accents.
- Imagery: live-map overlays, status chips, and work-state visuals rather than decorative art.
- Iconography: clearer status glyphs, stronger signal hierarchy, more utility than ornament.

### Admin motif

- Tone: dense, precise, analytical.
- Color direction: neutral surfaces with restrained indigo, red, and amber emphasis for exception states.
- Imagery: charts, tables, dashboards, and very limited decorative illustration.
- Iconography: compact, crisp, data-oriented symbols.

### System-level rules

- Keep the same core components across portals, then vary spacing, accent, and density by role.
- Preserve keyboard and screen-reader clarity in tables, menus, and status chips.
- Make loading, empty, and error states feel intentional rather than generic.
- Align design decisions with confirmed backend constraints instead of hiding them.

## 9. Route-By-Route Implementation Plan

Phase legend:
- Phase 1: Fix dead-ends and route cleanup.
- Phase 2: Consolidate current flows and finish role-specific onboarding.
- Phase 3: Add new feature routes.
- Phase 4: Responsive and visual polish.

### 9.1 Shared and Auth Routes

| Route | Change | Scope | Dependencies | Phase |
|---|---|---|---|---|
| `/auth/signin` | Modified page | Quick win | Unified Better Auth sign-in, role redirect logic. | Phase 2 |
| `/auth/signup` | Modified page | Quick win | Unified Better Auth sign-up, helper-intent copy. | Phase 2 |
| `/auth/forgot-password` | Keep | Quick win | Better Auth password reset. | Phase 2 |
| `/auth/reset-password` | Keep | Quick win | Password reset token flow. | Phase 2 |
| `/auth/check-email` | Modified page | Quick win | Email verification messaging. | Phase 2 |
| `/auth/verify-email` | Modified page | Quick win | Email verification callback flow. | Phase 2 |
| `/auth/2fa-verify` | Modified page | Quick win | Better Auth 2FA challenge support. | Phase 2 |
| `/dashboard` | Keep as router only | Quick win | Role routing through `getHomeRouteForRole`. | Phase 1 |
| `/account/settings` | Modified page | Larger build | 2FA setup flow, helper entry point, account security UX. Any UI that depends on a local QR or safer secret flow is blocked until the third-party QR and encryption fallback constraints are addressed. | Phase 2 |

### 9.2 Consumer Routes

| Route | Change | Scope | Dependencies | Phase |
|---|---|---|---|---|
| `/customer` | Modified page | Larger build | Booking and payment summary data, active-booking state, discovery content. | Phase 2 |
| `/customer/book` | Modified page | Larger build | Booking creation flow, map services, and matching behavior. UI should not assume async matching until the inline matcher constraint is resolved. | Phase 2 |
| `/customer/active` | Removed / merged | Quick win | Merge into `/customer/bookings/[id]` or `/customer`. | Phase 1 |
| `/customer/bookings` | Keep / refine | Quick win | Realtime booking sync and history data. | Phase 2 |
| `/customer/bookings/[id]` | Keep / refine | Larger build | Shared `BookingDetails`, booking events, payment state, OTP or completion actions. | Phase 2 |
| `/customer/payments` | Keep / refine | Larger build | Payment list, receipts, checkout verification, PDF downloads. | Phase 2 |
| `/customer/reviews` | Keep / refine | Quick win | Review submission endpoint and booking history. | Phase 2 |
| `/customer/helper/[id]` | Keep / refine | Larger build | Needs a real helper profile data source before it can be treated as a product page. | Phase 3 |
| `/customer/bookings/[id]/support` | Newly proposed page | Larger build | Booking-level support workflow, disputes or escalation API. | Phase 3 |
| `/customer/addresses` | Newly proposed page | Quick win | Saved-address storage and selection flow. | Phase 3 |

### 9.3 Helper Routes

| Route | Change | Scope | Dependencies | Phase |
|---|---|---|---|---|
| `/helper` | Modified page | Larger build | Realtime incoming jobs, availability state, earnings data. | Phase 2 |
| `/helper/availability` | Keep / refine | Quick win | Presence publishing and slot persistence. | Phase 2 |
| `/helper/active` | Removed / merged | Quick win | Merge into `/helper/bookings/[id]` or `/helper`. | Phase 1 |
| `/helper/incoming-jobs` | Keep / refine | Larger build | WebSocket queue, live location, current-job state. | Phase 2 |
| `/helper/job-history` | Keep / refine | Quick win | Booking history and realtime update feed. | Phase 2 |
| `/helper/earnings` | Keep / refine | Larger build | Payout and bank data. Any UI that exposes sensitive payout secrets or banking details should not move ahead of the encryption fallback fix. | Phase 2 |
| `/helper/verification` | Keep / refine | Larger build | Verification status API, onboarding status, KYC state machine. | Phase 2 |
| `/helper/video-kyc` | Keep / refine | Larger build | Scheduler API, calendar availability, join state. | Phase 2 |
| `/helper/video-kyc/join` | Keep / refine | Quick win | Video session availability and access gating. | Phase 2 |
| `/helper/onboarding` | Keep / refine | Larger build | Draft save, submission API, onboarding rules. | Phase 2 |
| `/helper/verification-pending` | Keep / refine | Quick win | Verification status and application ID. | Phase 2 |
| `/helper/bookings/[id]` | Keep / refine | Larger build | Shared `BookingDetails`, OTP start/complete actions, booking updates. | Phase 2 |
| `/helper/calendar` | Newly proposed page | Quick win | Availability and slot data model. | Phase 3 |
| `/helper/certifications` | Newly proposed page | Larger build | Document uploads and verification metadata. | Phase 3 |
| `/helper/service-area` | Newly proposed page | Larger build | Geo-fencing or service radius data. | Phase 3 |

### 9.4 Admin Routes

| Route | Change | Scope | Dependencies | Phase |
|---|---|---|---|---|
| `/admin` | Keep / refine | Quick win | Platform metrics and summary data. | Phase 2 |
| `/admin/users` | Keep / refine | Quick win | User directory and moderation actions. | Phase 2 |
| `/admin/helpers` | Keep / refine | Quick win | Helper moderation and status actions. | Phase 2 |
| `/admin/verifications` | Keep / refine | Larger build | Verification queue, document review, video KYC scheduler. | Phase 2 |
| `/admin/bookings` | Keep / refine | Larger build | Booking monitoring and status data. | Phase 2 |
| `/admin/payments` | Keep / refine | Larger build | Payment audit and reconciliation data. | Phase 2 |
| `/admin/disputes` | Keep / refine | Larger build | Dispute workflow and resolution notes. | Phase 2 |
| `/admin/payouts` | Keep / refine | Larger build | Payout settlement model and status transitions. | Phase 2 |
| `/admin/analytics` | Keep / refine | Larger build | Reporting datasets and chart aggregation. | Phase 2 |
| `/admin/service-catalog` | Newly proposed page | Larger build | Service taxonomy and pricing admin APIs. | Phase 3 |
| `/admin/announcements` | Newly proposed page | Quick win | Broadcast messaging backend or CMS. | Phase 3 |
| `/admin/roles` | Newly proposed page | Larger build | Role and permission management backend. | Phase 3 |

### 9.5 Suggested delivery order

1. Phase 1: remove redirect-only dead-ends and replace the hardcoded helper profile placeholder.
2. Phase 2: finish the shared auth, onboarding, booking detail, and admin review flows.
3. Phase 3: add the new feature routes that expand the product without changing the core architecture.
4. Phase 4: apply responsive and visual polish across the three portals after the route map is stable.

## 10. Figma-Style Screen Inventory

This section is intentionally written like a Figma page/frame tree. It is a build guide for the next designer, not a literal Figma export.

### 10.1 Consumer Portal

Visual direction:
- Calm, discovery-led, reassuring.
- Warm neutrals with sea-glass, teal, and soft success accents.
- Light lifestyle imagery, subtle map cues, rounded line icons, soft shadows.

| Page | Key frames and states |
|---|---|
| Consumer / Home | Default: greeting, active booking hero, quick actions, wallet summary, recent history. Loading: card skeleton grid. Empty: first-booking guidance and service shortcuts. Error: fetch failure banner with retry. |
| Consumer / Book | Default: map-led booking canvas, service chips, sticky action bar. Loading: map and panel skeletons. Empty: no service chosen guidance. Error: map or service lookup failure with retry. |
| Consumer / Bookings | Default: active and past sections, status chips, journey summary cards. Loading: list skeletons. Empty: no bookings guidance with a primary booking CTA. Error: live-sync or fetch error banner. |
| Consumer / Booking Detail | Default: status header, timeline, map, action rail, payment context. Loading: detail skeleton and map placeholder. Empty: booking not found state. Error: failure banner with back and retry. |
| Consumer / Payments | Default: summary cards, receipts list, pending-due banner. Loading: receipt skeletons. Empty: no payments state. Error: payment fetch or checkout error. |
| Consumer / Reviews | Default: completed booking review cards, star controls, comment boxes. Loading: card skeletons. Empty: no completed bookings state. Error: submit failure with retry. |
| Consumer / Helper Profile (proposed replacement) | Default: helper hero, services, ratings, reviews, sticky Book Now CTA. Loading: profile skeletons. Empty: missing-profile fallback. Error: lookup error and back navigation. |

### 10.2 Helper Portal

Visual direction:
- Operational, high-trust, fast-moving.
- Deep slate or navy with energetic green, amber, and alert accents.
- Live map overlays, status chips, crisp utility iconography, minimal decorative imagery.

| Page | Key frames and states |
|---|---|
| Helper / Home | Default: availability toggle, incoming request preview, active task, earnings summary. Loading: card skeletons and disabled controls. Empty: no jobs or zero-earnings guidance. Error: reconnect or refresh banner. |
| Helper / Availability | Default: status control, slot editor, save actions. Loading: slot skeletons. Empty: no slots yet guidance. Error: validation or save failure. |
| Helper / Incoming Jobs | Default: queue, map, current job panel, accept/reject actions. Loading: queue skeleton and map placeholder. Empty: no incoming requests state. Error: WebSocket disconnect or fetch failure. |
| Helper / Job History | Default: journey summary, active jobs, past jobs, realtime updates. Loading: list skeletons. Empty: no completed jobs state. Error: history fetch or refresh failure. |
| Helper / Earnings | Default: gross/net cards, payout form, payout history. Loading: summary and table skeletons. Empty: zero-balance or no-history state. Error: load or payout request failure. |
| Helper / Verification | Default: pending, approved, rejected, or resubmission state with clear next actions. Loading: polling or status skeleton. Empty: rare, treat as a data failure. Error: verification fetch failure and retry. |
| Helper / Video KYC | Default: slot picker and scheduled-session card. Loading: slot and session skeletons. Empty: no slots or no appointment guidance. Error: scheduling failure banner. |
| Helper / Video KYC / Join | Default: join-ready or too-early guidance. Loading: small waiting card. Empty: no session or expired session. Error: join failure or missing session. |
| Helper / Onboarding | Default: multi-step wizard with draft restore. Loading: step skeletons. Empty: incomplete-step guidance. Error: submission or persistence failure. |
| Helper / Verification Pending | Default: success or under-review timeline, application ID, next actions. Loading: minimal pending card if needed. Empty: missing application data fallback. Error: lookup failure. |
| Helper / Booking Detail | Default: shared booking detail with helper actions, OTP, and map. Loading: detail skeleton. Empty: booking not found state. Error: action failure with retry. |

### 10.3 Admin Portal

Visual direction:
- Dense, precise, analytical.
- Neutral gray surfaces with restrained indigo, red, and amber exception states.
- Tables, charts, compact cards, minimal imagery, data-grid iconography.

| Page | Key frames and states |
|---|---|
| Admin / Overview | Default: KPI cards, financial summary, quick links, operations grid. Loading: metric skeletons. Empty: partial-data state. Error: dashboard fetch failure. |
| Admin / Users | Default: search, filters, user table, row actions. Loading: table skeletons. Empty: no matching users state. Error: list or mutation error. |
| Admin / Helpers | Default: helper table, filters, status actions. Loading: table skeletons. Empty: no matching helpers state. Error: fetch or mutation error. |
| Admin / Verifications | Default: metrics, document queue, detail pane, video KYC controls. Loading: queue and pane skeletons. Empty: no pending verifications. Error: review or scheduling failure. |
| Admin / Bookings | Default: filters, booking table, live cues. Loading: metric and table skeletons. Empty: no matching bookings. Error: realtime or fetch failure. |
| Admin / Payments | Default: payment table, status chips, copy actions. Loading: table skeletons. Empty: no matching payments. Error: fetch or copy failure. |
| Admin / Disputes | Default: summary cards, dispute list, detail panel, resolution form. Loading: list and form skeletons. Empty: no disputes in scope. Error: save or fetch failure. |
| Admin / Payouts | Default: payout filters, status table, row actions. Loading: table skeletons. Empty: no matching payouts. Error: mutation or fetch failure. |
| Admin / Analytics | Default: KPI cards, sparklines, charts, operational breakdowns. Loading: chart skeletons. Empty: no analytic data state. Error: analytics fetch failure. |

### 10.4 Screen inventory guidance for the next Figma file

- Keep each portal as its own Figma page.
- Within each portal, group frames by route name and then by state.
- Label loading, empty, and error variants explicitly so engineers can map them to implementation states.
- Use the motif directions above to decide color accents, imagery style, and iconography, but do not let them override the shared component system.

## 11. Known Issues & Technical Debt

The tables below were built from a fresh direct read of the route and shared files, and they intentionally fold the previously confirmed constraints into the broader issue inventory.

### 11.1 Shared/Auth

| Severity | File | Issue | Why it matters |
|---|---|---|---|
| High | [apps/web/src/app/api/bookings/route.ts](apps/web/src/app/api/bookings/route.ts) | Booking matching is started inline after the booking row is created. If the matcher is slow or the serverless runtime cuts the request short, the UI can imply a completed request while the downstream assignment is still incomplete. | This is both a functional reliability risk and the known backend constraint that blocks any UI from assuming async matching. |
| High | [apps/web/src/app/(portal)/account/settings/page.tsx](apps/web/src/app/%28portal%29/account/settings/page.tsx) | 2FA setup renders the QR code through `api.qrserver.com` using the `otpauth://` payload. That sends the secret material to a third-party service instead of keeping QR generation local. | This is a security and data-handling concern; any safer QR flow depends on a backend/security fix first. |
| High | [apps/web/src/lib/security/encryption.ts](apps/web/src/lib/security/encryption.ts) | The encryption helper falls back to `process.env.AUTH_SECRET` and then `dev-only-local-key` when `ENCRYPTION_KEY` is missing. Misconfiguration can silently downgrade secret protection. | This is a key-handling risk for payout, token, or secret storage flows, and the UI should not be scheduled ahead of removing the fallback. |
| Medium | [apps/web/src/app/(auth)/auth/verify-email/page.tsx](apps/web/src/app/%28auth%29/auth/verify-email/page.tsx) and [apps/web/src/features/auth/components/verify-email-client-page.tsx](apps/web/src/features/auth/components/verify-email-client-page.tsx) | The verify-email screen is time-based and always advances to success after a fixed delay instead of reflecting a real token validation result. It does not surface a genuine error path for a failed verification attempt. | Users can see a success state even when the backend verification never succeeded, which makes the auth flow misleading. |
| Medium | [apps/web/src/app/(auth)/auth/check-email/page.tsx](apps/web/src/app/%28auth%29/auth/check-email/page.tsx) | The post-signup guidance only offers “sign in again” and “sign up again.” There is no resend flow, which can push users into duplicate-account churn if the original email is lost. | This is an error-handling and usability gap in a critical auth recovery path. |

### 11.2 Consumer

| Severity | File | Issue | Why it matters |
|---|---|---|---|
| High | [apps/web/src/app/(portal)/customer/helper/[id]/page.tsx](apps/web/src/app/%28portal%29/customer/helper/%5Bid%5D/page.tsx) | The helper profile is entirely hardcoded, including the helper’s name, skills, reviews, and pricing, and the avatar is loaded from an external placeholder image service. | This is dead/placeholder content, not a real product page, so it should never be treated as an authoritative booking surface. |
| Medium | [apps/web/src/app/(portal)/customer/active/page.tsx](apps/web/src/app/%28portal%29/customer/active/page.tsx) | The route is only a redirect helper into the active booking detail or empty state. It duplicates a concept already covered by the bookings list and booking detail flow. | This adds a naming and routing inconsistency without adding unique value. |
| Medium | [apps/web/src/app/(portal)/customer/book/page.tsx](apps/web/src/app/%28portal%29/customer/book/page.tsx) | The booking page uses `Suspense` with a `null` fallback around the map and only surfaces a warning for an invalid `service` query. There is no dedicated error UI if the map, geolocation, or service bootstrap fails. | A blank loading experience and missing failure state can make the booking entry point feel broken. |
| Medium | [apps/web/src/app/(portal)/customer/reviews/page.tsx](apps/web/src/app/%28portal%29/customer/reviews/page.tsx) | Initial fetch failures are swallowed into empty local arrays, and both the bookings and reviews requests ignore `response.ok`. API failure can therefore look like “no completed bookings yet.” | This is an error-handling gap that hides real data problems behind a harmless-looking empty state. |
| Medium | [apps/web/src/app/(portal)/customer/payments/page.tsx](apps/web/src/app/%28portal%29/customer/payments/page.tsx) | The page fetches all bookings and payments up front, then recomputes derived maps client-side for receipts, due bookings, and transaction history. There is no pagination or virtualization for larger accounts. | This is an avoidable performance concern and can become expensive as booking history grows. |

### 11.3 Helper

| Severity | File | Issue | Why it matters |
|---|---|---|---|
| Medium | [apps/web/src/app/(portal)/helper/active/page.tsx](apps/web/src/app/%28portal%29/helper/active/page.tsx) | The route is also a redirect-only helper for active jobs. It overlaps with the helper booking detail flow and does not create a distinct workspace. | This is a route naming inconsistency and a small but unnecessary navigation hop. |
| Medium | [apps/web/src/app/(portal)/helper/page.tsx](apps/web/src/app/%28portal%29/helper/page.tsx) | The helper home pushes geolocation updates on mount and keeps sending heartbeats every 30 seconds, with higher-frequency tracking when a booking is active. That is a lot of browser-side presence activity for a single landing page. | It can create battery, privacy, and performance overhead, especially on low-end devices or unstable connections. |
| Medium | [apps/web/src/app/(portal)/helper/availability/page.tsx](apps/web/src/app/%28portal%29/helper/availability/page.tsx) | The page opens a websocket with an empty callback via `useWebSocket(session?.user.id || "", () => {})`, then separately handles status and slot changes. The connection appears to exist mostly for side effects. | This is a maintainability and performance smell because the live connection has no visible page-level intent. |
| High | [apps/web/src/app/(portal)/helper/verification/verification-client.tsx](apps/web/src/app/%28portal%29/helper/verification/verification-client.tsx) | The rejected-state recovery flow links to `/contact`, but there is no `/contact` route in the workspace. That makes the recovery CTA a dead end. | This is a broken navigation path in a critical compliance/onboarding flow. |
| Medium | [apps/web/src/app/(portal)/helper/earnings/page.tsx](apps/web/src/app/%28portal%29/helper/earnings/page.tsx) | The payout form defaults the withdrawal amount to the full available balance and requests payment without an explicit confirmation step. It also fetches bookings, payments, and payouts together on every load. | This creates accidental-action risk for withdrawals and adds unnecessary client-side load in a finance-sensitive view. |
| Medium | [apps/web/src/app/(portal)/helper/video-kyc/join/page.tsx](apps/web/src/app/%28portal%29/helper/video-kyc/join/page.tsx) | The final fallback when the join gate fails is only a generic alert that tells the user to go back to the Video KYC page. There is no direct retry or support route in the error branch. | This is an error-handling gap in a gated, time-sensitive workflow. |

### 11.4 Admin

| Severity | File | Issue | Why it matters |
|---|---|---|---|
| Medium | [apps/web/src/app/(portal)/admin/verifications/page.tsx](apps/web/src/app/%28portal%29/admin/verifications/page.tsx) | The queue page pulls a large set of documents and video KYC data into one client-side view and filters/sorts the data in memory. There is no pagination or virtualization in the visible flow. | This will scale poorly as verification volume grows and can become sluggish for reviewers. |
| Medium | [apps/web/src/app/(portal)/admin/disputes/page.tsx](apps/web/src/app/%28portal%29/admin/disputes/page.tsx) | The disputes workspace also loads the full list and filters it client-side with a single selected-case inspector. | The page is workable at small scale, but it risks becoming slow and unwieldy as dispute volume grows. |
| Medium | [apps/web/src/app/(portal)/admin/payments/page.tsx](apps/web/src/app/%28portal%29/admin/payments/page.tsx) | The payments audit page fetches up to 200 bookings and 200 payments, then builds the entire view in memory. It exposes a broad amount of payment and provider metadata in one dense table. | This is a performance concern and a data-density concern for a sensitive finance surface. |
| Medium | [apps/web/src/app/(portal)/admin/payouts/page.tsx](apps/web/src/app/%28portal%29/admin/payouts/page.tsx) | Status updates rely on `window.prompt` for provider transfer IDs and failure reasons. Those prompts are not a strong accessibility pattern and are easy to mistype or dismiss. | This is a usability and accessibility gap in an operations-critical workflow. |
| Low | [apps/web/src/app/(portal)/admin/analytics/page.tsx](apps/web/src/app/%28portal%29/admin/analytics/page.tsx) | The revenue chart only renders the last few periods from the available timeseries, which can hide broader trend context. Some derived values also depend on numeric parsing of API strings. | The page works, but the charting choice can under-communicate long-term trends and produce brittle derived metrics. |
