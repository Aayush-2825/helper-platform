# Implementation Plan: Booking Flow UI

## Overview

Implement the end-to-end booking flow UI across the Next.js frontend. Tasks are ordered so each step builds on the previous: shared components first, then customer-facing pages, then helper-facing pages, then the new API routes, and finally wiring everything together with real-time updates.

## Tasks

- [x] 1. Create shared StatusBadge component
  - Create `apps/web/src/components/StatusBadge.tsx`
  - Map each booking status to a human-readable label and a distinct visual style using shadcn `Badge` variants or className overrides:
    - `requested` → "Searching for helper…" (amber), with animated pulse `span` alongside
    - `accepted` → "Helper accepted" (blue)
    - `in_progress` → "Job in progress" (purple)
    - `completed` → "Completed" (green)
    - `cancelled` → "Cancelled" (red/gray)
  - Export a `StatusBadge` component accepting `status: string` prop
  - _Requirements: 2.3, 3.1, 3.5_

- [x] 2. Implement BookingCard component
  - Create `apps/web/src/components/BookingCard.tsx`
  - Accept a booking object matching the `booking` table shape (id, categoryId, addressLine, city, quotedAmount, requestedAt, acceptedAt, startedAt, completedAt, status)
  - Render: category, `addressLine + ", " + city`, quoted amount formatted as `₹{amount}`, `requestedAt` formatted as a readable date/time, and `<StatusBadge status={booking.status} />`
  - Conditionally render `acceptedAt` when status is `accepted`, `in_progress`, or `completed`
  - Conditionally render `startedAt` when status is `in_progress` or `completed`
  - Conditionally render `completedAt` when status is `completed`
  - Use shadcn `Card`, `CardContent` from `@/components/ui/card`
  - _Requirements: 2.2, 3.2, 3.3, 3.4_

- [x] 3. Replace hardcoded booking button with BookingForm in map-component.tsx
  - In `apps/web/src/components/map-component.tsx`, replace the `<button>Simulate New Booking</button>` with a `<BookingForm>` component rendered below the map
  - Create `apps/web/src/components/BookingForm.tsx` with:
    - A `<select>` for `categoryID` populated with the enum values: `driver`, `electrician`, `plumber`, `cleaner`, `chef`, `delivery_helper`, `caretaker`, `security_guard`, `other`
    - An `<input>` for `addressLine` (required)
    - An `<input>` for `city` (required)
    - A number `<input>` for `quotedAmount` (required, positive integer)
    - A `<textarea>` for `notes` (optional)
    - A `<input type="datetime-local">` for `scheduledFor` (optional)
    - A submit `<Button>` that is disabled and shows a spinner while submitting
  - Accept `latitude` and `longitude` as props (passed from `draggableMarker` in `MyMap`)
  - On submit: validate required fields client-side, show field-level errors without calling the API if invalid
  - On submit with valid fields: call `POST /api/bookings` with all fields including `latitude` and `longitude`
  - On 201 response: show a success message and reset the form
  - On non-201 response: display the error message from the response body
  - Use shadcn `Button`, `Card` from `@/components/ui/`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_

- [x] 4. Implement Customer Bookings List page
  - Rewrite `apps/web/src/app/(portal)/customer/bookings/page.tsx` as a client component
  - On mount: fetch `GET /api/bookings` and store results in state; show a loading skeleton (3 placeholder `Card` elements) while fetching; show an error message if the fetch fails; show an empty state message if the array is empty
  - Render fetched bookings as `<BookingCard>` components ordered by `requestedAt` descending
  - Subscribe to WS events via `useRealtimeEvents({ userId, userRole, eventTypes: ["booking_update"] })`
  - When a `booking_update` event arrives, update the matching booking's `status` (and relevant timestamp fields) in local state without refetching
  - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

- [x] 5. Checkpoint — verify customer flow compiles and renders
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Expand IncomingJob type and useIncomingJobs hook
  - In `apps/web/src/app/(portal)/helper/incoming-jobs/useIncomingJobs.ts`, extend the `IncomingJob` type to include:
    - `categoryId: string`
    - `addressLine: string`
    - `city: string`
    - `quotedAmount: number`
    - `distanceKm?: number`
    - `customerName?: string`
    - `expiresAt?: string` (ISO string)
  - No logic changes needed in `addJob`/`removeJob`; the richer fields will be populated from the WS event payload
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Rebuild IncomingJobsPanel with rich data and expiry countdown
  - Rewrite `apps/web/src/components/IncomingJobsPanel.tsx`
  - For each job, display: category (formatted from `categoryId`), `addressLine + ", " + city`, `₹{quotedAmount}`, distance (`{distanceKm} km` if present), customer name (if present)
  - Add an expiry countdown: use `setInterval` (1 s) inside the card to count down from `expiresAt`; when countdown reaches zero, visually mark the card as expired (muted style) and disable both buttons
  - While an accept/reject action is in progress for a specific job, disable both buttons for that job and show a spinner on the active button
  - On accept error (non-200), display the error message from the response body without removing the job
  - Show an empty state message when `jobs.length === 0`
  - Update `IncomingJob` import to use the expanded type from `useIncomingJobs.ts`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [x] 8. Create POST /api/bookings/[id]/start route
  - Create `apps/web/src/app/api/bookings/[id]/start/route.ts`
  - Follow the same pattern as `accept/route.ts`: get session via `auth.api.getSession({ headers: await headers() })`, query `helperProfile` by `session.user.id`, look up the booking by `id`
  - Validate: booking must exist, caller must be the assigned helper (`booking.helperId === session.user.id`), booking status must be `accepted`; return 401/403/400 with descriptive messages otherwise
  - Update booking: set `status = "in_progress"`, `startedAt = now`, `updatedAt = now` using a conditional `WHERE status = 'accepted'` update
  - Call `publishBookingEvent({ bookingId, customerId, helperId, eventType: "in_progress" })`
  - Return 200 with the updated booking on success; 500 on unexpected error
  - _Requirements: 6.1, 6.3, 6.5_

- [x] 9. Create POST /api/bookings/[id]/complete route
  - Create `apps/web/src/app/api/bookings/[id]/complete/route.ts`
  - Same auth/profile lookup pattern as `start/route.ts`
  - Validate: booking must exist, caller must be the assigned helper, booking status must be `in_progress`; return 401/403/400 otherwise
  - Update booking: set `status = "completed"`, `completedAt = now`, `updatedAt = now` using a conditional `WHERE status = 'in_progress'` update
  - Call `publishBookingEvent({ bookingId, customerId, helperId, eventType: "completed" })`
  - Return 200 with the updated booking on success; 500 on unexpected error
  - _Requirements: 6.2, 6.4, 6.5_

- [x] 10. Create JobCard component with Start/Complete action buttons
  - Create `apps/web/src/components/JobCard.tsx`
  - Accept a booking object (same shape as `BookingCard`) plus optional callbacks `onStart?: (id: string) => Promise<void>` and `onComplete?: (id: string) => Promise<void>`
  - Render the same fields as `BookingCard` (category, address, amount, timestamps, `<StatusBadge>`)
  - When `status === "accepted"`, render a "Start Job" `<Button>` that calls `onStart(booking.id)`; disable and show spinner while in progress; display error message on failure
  - When `status === "in_progress"`, render a "Complete Job" `<Button>` that calls `onComplete(booking.id)`; disable and show spinner while in progress; display error message on failure
  - _Requirements: 6.6, 6.7, 6.8, 6.9, 6.10, 6.11_

- [x] 11. Implement Helper Job History page
  - Rewrite `apps/web/src/app/(portal)/helper/job-history/page.tsx` as a client component
  - On mount: fetch `GET /api/bookings`; show loading skeleton while fetching; show error message on failure; show empty state when no bookings
  - Split bookings into two groups: "Active Jobs" (`status === "accepted" || status === "in_progress"`) and "Past Jobs" (`status === "completed" || status === "cancelled"`), each ordered by `requestedAt` descending
  - Render each booking as a `<JobCard>` with `onStart` and `onComplete` callbacks that call the respective API routes and update local state on success
  - Subscribe to WS events via `useRealtimeEvents` to update job statuses in real-time (same pattern as customer bookings page)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.7, 6.9, 6.12_

- [x] 12. Final checkpoint — ensure all components wire together correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All API routes follow the pattern in `accept/route.ts`: session via `auth.api.getSession`, db from `@/db`, schema from `@/db/schema`, events via `publishBookingEvent`, cache headers via `NO_STORE_HEADERS`
- WS events arrive as `{ type: "event", event: "booking_update", data: { bookingId, eventType, ... } }` — match on `data.bookingId` to update local state
- `helperServiceCategoryEnum` values: `driver`, `electrician`, `plumber`, `cleaner`, `chef`, `delivery_helper`, `caretaker`, `security_guard`, `other`
