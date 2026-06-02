# Complete Feature Inventory

This document provides an exhaustive inventory of all features within the Helper Platform, categorized by product strategy and broken down by technical implementation.

---

## 1. MVP Features

### Authentication & Account Management
1. **Feature name**: Authentication & Account Management
2. **Purpose**: Secure user sign-up, login, session management, and credential recovery.
3. **User type**: Customers, Helpers, Admins
4. **Frontend pages/components**: SignIn (`/auth/signin`), SignUp (`/auth/signup`), 2FA flows.
5. **Backend APIs**: `ALL /api/auth/[...all]` (Better Auth handler).
6. **Database tables/models**: `user`, `session`, `account`, `verification`.
7. **External services**: Resend (Emails), Google OAuth, Better Auth.
8. **Business logic summary**: Validate credentials, manage cryptographically secure JWE cookies, handle double-opt-in email flows.
9. **Current implementation status**: Fully Implemented.
10. **Missing functionality**: Suspicious login detection (rate limiting exists, but anomaly detection does not).
11. **Technical complexity level**: Low-Medium (delegated mostly to Better Auth).
12. **Monetization potential**: Low direct; acts as the gateway to paid features.

### Booking Request & Dispatch
1. **Feature name**: Booking Request & Dispatch
2. **Purpose**: Allow customers to request a service and match them dynamically with an available helper.
3. **User type**: Customers, Helpers
4. **Frontend pages/components**: Customer Booking Wizard, Helper Incoming Jobs feed/modal.
5. **Backend APIs**: `POST /api/bookings`, `POST /api/realtime/broadcast`
6. **Database tables/models**: `booking`, `booking_candidate`, `booking_status_event`.
7. **External services**: None directly (relies on internal DB logic).
8. **Business logic summary**: Create booking intent, rank nearby available helpers, insert candidate rows, push realtime socket event to targets.
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Automatic timeout fallback to next rank tier if initial helper ignores the request.
11. **Technical complexity level**: High.
12. **Monetization potential**: High (Core commission revenue engine).

### Job Lifecycle Management
1. **Feature name**: Job Lifecycle Management
2. **Purpose**: Track a booking from Accept -> Start -> Complete -> Cancel.
3. **User type**: Customers, Helpers
4. **Frontend pages/components**: Active Job Dashboard, Service Timer.
5. **Backend APIs**: `POST /api/bookings/[id]/[action]` (accept, reject, start, complete, cancel).
6. **Database tables/models**: `booking`, `booking_status_event`.
7. **External services**: None.
8. **Business logic summary**: State machine transitions enforcing strict rules (e.g. cannot "complete" a job that hasn't "started").
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Geo-fencing block (requiring helper to be physically near customer to hit "start").
11. **Technical complexity level**: Medium.
12. **Monetization potential**: High (Locking in fulfillment).

### Customer Checkout & Payments
1. **Feature name**: Customer Checkout & Payments
2. **Purpose**: Process service payments and hold funds in escrow.
3. **User type**: Customers
4. **Frontend pages/components**: Checkout screen, Job Completion receipt page.
5. **Backend APIs**: `POST /api/payments`, `POST /api/payments/verify`, `POST /api/payments/webhook`.
6. **Database tables/models**: `payment_transaction`, `booking`.
7. **External services**: Razorpay.
8. **Business logic summary**: Generate Razorpay order, securely capture frontend signature, verify signature asynchronously via webhook, lock funds.
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Support for post-job tip additions.
11. **Technical complexity level**: High.
12. **Monetization potential**: High (Primary revenue capture).

### Reviews & Ratings
1. **Feature name**: Reviews & Ratings
2. **Purpose**: Ensure quality control by allowing customers to rate helpers post-job.
3. **User type**: Customers
4. **Frontend pages/components**: Post-job rating modal, Public Helper Profile.
5. **Backend APIs**: `POST /api/reviews`.
6. **Database tables/models**: `review`, `helper_profile`.
7. **External services**: None.
8. **Business logic summary**: Receive 1-5 star rating with text, aggregate average into the `helper_profile` table.
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Reciprocal rating (helpers rating customers).
11. **Technical complexity level**: Low.
12. **Monetization potential**: Low indirect (improves marketplace trust).

---

## 2. Growth Features

### Helper Onboarding & Video KYC
1. **Feature name**: Helper Onboarding & Video KYC
2. **Purpose**: Vet service providers via structured document collection and live video interviews.
3. **User type**: Helpers, Admins
4. **Frontend pages/components**: Multi-step Onboarding form, File Uploader, Calendar Slot Picker.
5. **Backend APIs**: `POST /api/helpers/onboarding`, `POST /api/verifications/video-kyc/schedule`, `POST /api/cloudinary/sign`.
6. **Database tables/models**: `helper_onboarding_draft`, `helper_kyc_document`, `video_kyc_session`.
7. **External services**: Cloudinary (files), Google Calendar/Meet API.
8. **Business logic summary**: Save progress drafts, upload docs direct-to-cloud, provision Google Meet links, transition helper to "verified" state post-call.
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Automated OCR data extraction from uploaded IDs.
11. **Technical complexity level**: High.
12. **Monetization potential**: Medium (Scales supply-side trust, allowing higher price points).

### Web Push Notifications
1. **Feature name**: Web Push Notifications
2. **Purpose**: Re-engage offline users without requiring native App Store downloads.
3. **User type**: Customers, Helpers
4. **Frontend pages/components**: Browser permission prompt, `sw.js` (Service Worker).
5. **Backend APIs**: None formal yet (schema exists).
6. **Database tables/models**: `helper_web_push_subscription`.
7. **External services**: Browser VAPID Push Services.
8. **Business logic summary**: Register device `p256dh` keys, trigger async push events for missed jobs.
9. **Current implementation status**: Partially implemented/Experimental.
10. **Missing functionality**: Active event dispatch pipeline tying socket events to fallback Web-Push triggers.
11. **Technical complexity level**: Medium.
12. **Monetization potential**: Medium (High conversion recovery).

---

## 3. Premium Features

### Organizations & Teams (B2B)
1. **Feature name**: Organizations & Teams (B2B)
2. **Purpose**: Allow business clients (e.g., property managers) to share billing and team accounts.
3. **User type**: Business Customers
4. **Frontend pages/components**: Organization management settings layout.
5. **Backend APIs**: Handled under `better-auth` org plugin mapping.
6. **Database tables/models**: Tied to `better-auth` org tables (tenant mapping).
7. **External services**: None.
8. **Business logic summary**: Define tenant boundaries, map users to orgs, handle role-based access control inside the org.
9. **Current implementation status**: Hidden/Incomplete.
10. **Missing functionality**: Specialized B2B invoicing features and bulk-booking tools.
11. **Technical complexity level**: High.
12. **Monetization potential**: High (SaaS subscription tier overlay).

---

## 4. Admin Features

### Dispute Management
1. **Feature name**: Dispute Management
2. **Purpose**: Handle conflicts, refunds, and support tickets.
3. **User type**: Admins, Customers, Helpers
4. **Frontend pages/components**: Admin Dispute Desk, Customer support UI.
5. **Backend APIs**: `POST /api/disputes`.
6. **Database tables/models**: `dispute`, `dispute_message`.
7. **External services**: Payment Gateway (for reversing charges).
8. **Business logic summary**: Freeze helper payouts, open communication threads, apply resolution states mapping to financial ledger.
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Auto-refund execution strictly attached to dispute closing.
11. **Technical complexity level**: Medium.
12. **Monetization potential**: Preventative (Loss mitigation).

### Earnings & Payouts Processing
1. **Feature name**: Earnings & Payouts Processing
2. **Purpose**: Calculate commissions and release funds to Helpers.
3. **User type**: Admins, Helpers
4. **Frontend pages/components**: Helper Earnings Dashboard, Admin Payout Runner.
5. **Backend APIs**: `GET /api/admin/payouts`, `POST /api/admin/payouts/[id]`.
6. **Database tables/models**: `payout`, `payment_transaction`.
7. **External services**: Banking provider / Razorpay Route.
8. **Business logic summary**: Aggregate completed bookings, slice platform commission, batch generate payout instructions.
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Fully automated cron-based payout disbursement to external banks.
11. **Technical complexity level**: High.
12. **Monetization potential**: High (Commission retention).

### Admin Live Map Tracking
1. **Feature name**: Admin Live Map Tracking
2. **Purpose**: Visualize active jobs and helper clustering for operational reporting.
3. **User type**: Admins
4. **Frontend pages/components**: Admin Map Dashboard.
5. **Backend APIs**: `/api/realtime/ops/helper-presence`.
6. **Database tables/models**: None directly (memory/Redis intended).
7. **External services**: MapBox / MapLibre.
8. **Business logic summary**: Plot lat/lng pings onto a continuous UI overlay.
9. **Current implementation status**: Incomplete (MapLibre dependency exists, structure mocked).
10. **Missing functionality**: Scaled ingestion of helper location pings dropping into a timeseries visualizer.
11. **Technical complexity level**: High.
12. **Monetization potential**: Low (Pure operational efficiency).

---

## 5. AI Features

*Currently, there are no natively integrated AI features in the frontend/backend execution path. The `@modelcontextprotocol/sdk` indicates potential planning for agentic operations. Outstanding opportunities include:*
- **Smart Matching Ranker**: AI model generating `rank_score` assessing historical helper reviews, dispute likelihood, and distance.
- **Support Chatbot**: AI triage agent sitting ahead of the Dispute Management table reading `dispute_message` contexts.
- **Automated KYC OCR**: Processing ID images to auto-fill validation data.

---

## 6. Infrastructure Features

### Real-Time WebSocket Gateway
1. **Feature name**: Real-Time WebSocket Gateway
2. **Purpose**: Deliver live state changes instantly without HTTP polling.
3. **User type**: System Infrastructure
4. **Frontend pages/components**: Global WS Provider Wrapper (`apps/web`).
5. **Backend APIs**: `GET /api/realtime/ws-token`, `wss://[domain]/api/realtime/ws`.
6. **Database tables/models**: `notification_event`, `notification_queue`.
7. **External services**: None natively (needs Redis).
8. **Business logic summary**: Establish persistent L4 connection, authenticate via Next.js minted tickets, map instances in memory, deliver JSON payload frames.
9. **Current implementation status**: Implemented.
10. **Missing functionality**: Cross-instance Redis Sub/Pub.
11. **Technical complexity level**: Very High.
12. **Monetization potential**: Indirect (Enables real-time marketplace UX).

---

## Feature State Identifications

### Hidden Features
- **Organizations (B2B)**: Role-based access and tenant boundaries exist in the auth layer but aren't actively exposed in major customer UX paths.

### Incomplete Features
- **Admin Map Tracking**: UI framework exists but lacks the high-throughput ingestion pipeline for worker pings.
- **Automated Helpers Bank Payouts**: Payout batches generate, but the final API hooks executing the actual wire transfer out of Razorpay Route require closure.

### Experimental Features
- **Web Push logic (`sw.js`)**: Foundations mapped in the DB and public static folders, waiting on firm trigger implementations in the backend.

### Dead / Unreachable Features
- **`GET /api/cron/doc-expiry`**: Relies on an external Vercel connection. If `vercel.json` cron targets are misconfigured, this code path never executes automatically.