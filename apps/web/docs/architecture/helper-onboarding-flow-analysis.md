# Helper Onboarding Flow Analysis

## Scope
This document maps the current end-to-end helper onboarding flow across:
- Onboarding UI and submission APIs
- Admin verification review process
- Profile activation logic
- Booking and matching eligibility guards
- Relevant database schema/state transitions

Code sources reviewed:
- `apps/web/src/app/(portal)/helper/onboarding/page.tsx`
- `apps/web/src/app/(portal)/helper/helper-onboarding-client.tsx`
- `apps/web/src/components/onboarding/HelperOnboardingWizard.tsx`
- `apps/web/src/app/api/helpers/onboarding/route.ts`
- `apps/web/src/app/(portal)/helper/verification-pending/page.tsx`
- `apps/web/src/app/(portal)/helper/verification/page.tsx`
- `apps/web/src/app/(portal)/admin/verifications/page.tsx`
- `apps/web/src/app/api/verifications/route.ts`
- `apps/web/src/lib/helper/routing.ts`
- `apps/web/src/app/api/bookings/[id]/accept/route.ts`
- `apps/web/src/app/api/helpers/incoming-jobs/route.ts`
- `apps/web/src/services/matching/matching.ts`
- `apps/realtime/src/handlers/helper/search.handler.ts`
- `packages/db/src/schema/enums.ts`
- `packages/db/src/schema/web.ts`

## High-Level Flow

```mermaid
flowchart TD
  A[User signed in without helper profile] --> B[/helper/onboarding]
  B --> C[Complete 7-step wizard]
  C --> D[POST /api/helpers/onboarding]
  D --> E[Create or update helper_profile]
  E --> F[Set verification_status = pending]
  F --> G[Set is_active = false on resubmission/update path]
  E --> H[Store helper_kyc_document rows as pending]
  H --> I[Redirect /helper/verification-pending]

  I --> J[Admin reviews docs in /admin/verifications]
  J --> K[PATCH /api/verifications per document]
  K --> L{Aggregate all document statuses}
  L -->|all approved| M[helper_profile.verification_status = approved]
  M --> N[helper_profile.is_active = true]
  L -->|any rejected or resubmission_required| O[helper_profile.verification_status = resubmission_required]
  O --> P[helper_profile.is_active = false]
  L -->|otherwise| Q[helper_profile.verification_status = pending]

  N --> R[Helper can receive/accept jobs]
  P --> S[Helper blocked from job intake and acceptance]

  K --> T[Insert notification_event rows]
```

## Detailed Step-by-Step Journey

### 1) Entry and routing
1. Helper visits `/helper/onboarding`.
2. Server checks session and helper landing path.
3. If helper already has profile:
   - `approved` -> redirect to `/helper`
   - non-approved -> redirect to `/helper/verification-pending?id={profileId}`
4. If no helper profile exists, onboarding form is shown.

## 2) Onboarding form completion (7 steps)
Wizard steps in `HelperOnboardingWizard`:
1. Role selection (`individual` or `agency`)
2. Basic information
3. Service details
4. Pricing and availability
5. Identity verification documents
6. Bank/payout details
7. Final review and consent

Validation is enforced both client-side and server-side.

## 3) Onboarding submission API
`POST /api/helpers/onboarding` performs:
1. Session check (must be authenticated).
2. Existing profile check via helper status endpoint logic.
3. Resubmission policy:
   - Allowed only when current status is `rejected` or `resubmission_required`.
   - Existing approved/pending helpers do not create a new onboarding submission.
4. Payload validation (phone, category, availability, payout, document presence, etc.).
5. Upload handling to Cloudinary for profile/organization/KYC files.
6. Profile persistence:
   - Create or update `helper_profile`.
   - Force verification state to `pending`.
   - Set `availability_status`.
   - Set `is_active` false on update/resubmission path.
7. KYC document persistence:
   - On resubmission, existing KYC docs are deleted first.
   - New `helper_kyc_document` records inserted with `status = pending`.
8. User role update to `helper`.
9. Response includes `landingPath`, profile ID, and pending status messaging.

## 4) Pending verification UX
After submit, helper lands on `/helper/verification-pending` and can open `/helper/verification` to track:
- Profile verification status
- Per-document review status
- Rejection reasons where present

## 5) Admin review and approval logic
`PATCH /api/verifications` (admin-only):
1. Accepts per-document update to `approved | rejected | resubmission_required`.
2. Updates selected document metadata (`reviewedByUserId`, `reviewedAt`, `rejectionReason`).
3. Re-reads all docs for that profile and computes aggregate profile status:
   - All docs approved -> `helper_profile.verification_status = approved`, `is_active = true`
   - Any doc rejected/resubmission_required -> `verification_status = resubmission_required`, `is_active = false`
   - Else -> `verification_status = pending`
4. Inserts notification events:
   - admin audit event
   - helper in-app update event

## 6) Activation and capability gating
A helper can operate only when approved and active.

Enforced in key APIs/services:
1. `POST /api/bookings/[id]/accept`
   - Blocks if `verificationStatus !== approved`
   - Blocks if `isActive !== true`
2. `GET /api/helpers/incoming-jobs`
   - `canReceiveJobs` requires `verificationStatus = approved`, `availabilityStatus = online`, `isActive = true`
3. Web matching service (`apps/web/src/services/matching/matching.ts`)
   - Filters helpers by `isActive = true` and `verificationStatus = approved`
4. Realtime helper search (`apps/realtime/src/handlers/helper/search.handler.ts`)
   - Queries only approved helpers
   - Requires live/online presence heartbeat for discoverability

## Current State Model

### Verification statuses
From `helper_verification_status` enum:
- `pending`
- `approved`
- `rejected`
- `resubmission_required`

### Effective state matrix

| Profile verification status | is_active | Job intake eligibility | Accept booking eligibility |
|---|---:|---|---|
| pending | false (expected in onboarding flow) | No | No |
| approved | true | Yes (if online) | Yes |
| rejected | false | No | No |
| resubmission_required | false | No | No |

## Data Model Elements Involved

### `helper_profile`
Key onboarding fields:
- `user_id`
- `organization_id`
- `primary_category`
- `service_city`
- `service_radius_km`
- `verification_status`
- `availability_status`
- `is_active`

### `helper_kyc_document`
Key verification fields:
- `helper_profile_id`
- `document_type`
- `document_number`
- `file_url`
- `status`
- `reviewed_by_user_id`
- `reviewed_at`
- `rejection_reason`
- `expires_at`

### `notification_event`
Used by admin review path to enqueue audit/user notifications.

## Notable Behavior and Gaps

1. Single-pass activation
- Helper is activated immediately when all docs are approved.
- There is no additional post-document KYC pass in the current implementation.

2. Resubmission history is not preserved
- Existing KYC docs are deleted on resubmission, which removes prior attempt history.

3. `rejected` is not preserved at profile level in aggregate logic
- Admin can set an individual document to `rejected`, but profile aggregate currently maps any negative document state to `resubmission_required`.

4. `expires_at` exists on documents but no lifecycle enforcement is visible in onboarding flow
- No automatic expiry handling was found in this analysis scope.

## Practical End-to-End Summary
1. User submits onboarding + docs.
2. System creates helper profile as pending and queues docs for review.
3. Admin reviews each document.
4. System auto-computes profile status from document set.
5. Only approved + active helpers can receive/accept work.
6. Rejected/resubmission-required helpers must resubmit onboarding artifacts.
