# Requirements Document

## Introduction

This feature delivers a complete end-to-end UI polish for the booking flow across the Next.js frontend (`apps/web`). The backend is fully operational — bookings can be created, matched, accepted, rejected, and tracked via WebSocket events. What's missing is a polished, real-time UI for both customers and helpers that replaces placeholder components and raw JSON displays with proper forms, booking cards, status tracking, and job management panels.

The scope covers: a real booking creation form, a live-updating customer bookings list, a rich incoming jobs panel for helpers, a helper job history page, and a new in-progress/completion flow (start + complete actions) backed by two new API routes.

---

## Glossary

- **Booking_Form**: The UI component on the customer book page that collects category, address, quoted amount, notes, and scheduled time before submitting to `POST /api/bookings`.
- **Booking_List**: The customer-facing page that fetches bookings from `GET /api/bookings` and displays them as cards with status badges, updated in real-time via WebSocket events.
- **Booking_Card**: A single booking entry in the Booking_List showing status, category, address, amount, and timestamps.
- **Status_Badge**: A visual indicator on a Booking_Card reflecting the current booking status: `requested`, `accepted`, `in_progress`, `completed`, or `cancelled`.
- **Incoming_Jobs_Panel**: The helper-facing component that displays pending booking requests with full job details (category, address, amount, distance, customer name) and Accept/Reject actions.
- **Job_History_Page**: The helper-facing page listing all accepted, in-progress, completed, and cancelled bookings fetched from `GET /api/bookings`.
- **Job_Card**: A single booking entry in the Job_History_Page or active jobs section showing status, category, address, amount, and action buttons.
- **Start_Job_Button**: An action button on a Job_Card (visible when status is `accepted`) that calls `POST /api/bookings/[id]/start`.
- **Complete_Job_Button**: An action button on a Job_Card (visible when status is `in_progress`) that calls `POST /api/bookings/[id]/complete`.
- **Booking_Status_Flow**: The ordered progression of booking states: `requested` → `accepted` → `in_progress` → `completed` (or `cancelled` at any point before completion).
- **WS_Event**: A WebSocket message of type `event` received via `useWebSocket` hook, carrying `event` and `data` fields.
- **Realtime_Client**: The `publishBookingEvent` function in `apps/web/src/lib/realtime/client.ts` used server-side to broadcast WS events.
- **BookingAPI**: The Next.js API routes under `apps/web/src/app/api/bookings/`.
- **System**: The full-stack booking flow system comprising the Next.js frontend and Express/WS realtime server.

---

## Requirements

### Requirement 1: Booking Creation Form

**User Story:** As a customer, I want a real booking creation form with category, address, amount, notes, and scheduled time fields, so that I can submit meaningful booking requests instead of using a hardcoded placeholder button.

#### Acceptance Criteria

1. THE Booking_Form SHALL render a category selector populated with the values from `helperServiceCategoryEnum`: `driver`, `electrician`, `plumber`, `cleaner`, `chef`, `delivery_helper`, `caretaker`, `security_guard`, `other`.
2. THE Booking_Form SHALL render an address input field for `addressLine` and a city input field for `city`.
3. THE Booking_Form SHALL render a quoted amount input field accepting positive integers representing INR.
4. THE Booking_Form SHALL render an optional notes textarea.
5. THE Booking_Form SHALL render an optional scheduled time datetime picker for `scheduledFor`.
6. WHEN the customer submits the Booking_Form with all required fields valid, THE Booking_Form SHALL call `POST /api/bookings` with the collected field values including the map-selected latitude and longitude.
7. IF the `POST /api/bookings` response status is not 201, THEN THE Booking_Form SHALL display the error message from the response body to the customer.
8. WHEN the `POST /api/bookings` response status is 201, THE Booking_Form SHALL display a success confirmation message and reset the form fields.
9. WHILE the Booking_Form submission is in progress, THE Booking_Form SHALL disable the submit button and show a loading indicator.
10. IF a required field (categoryID, addressLine, city, quotedAmount) is empty on submit, THEN THE Booking_Form SHALL display a field-level validation error without calling the API.
11. THE Booking_Form SHALL preserve the existing map component so the customer can drag a pin to set latitude and longitude for the booking location.

---

### Requirement 2: Customer Bookings List with Real-Time Updates

**User Story:** As a customer, I want to see my bookings as a list of cards with status badges, updated live when a helper accepts or rejects, so that I can track the state of my requests without refreshing the page.

#### Acceptance Criteria

1. WHEN the Booking_List page loads, THE Booking_List SHALL fetch all bookings for the logged-in customer from `GET /api/bookings` and render each as a Booking_Card.
2. THE Booking_Card SHALL display: booking category, address (addressLine + city), quoted amount in INR, requested date/time, and a Status_Badge.
3. THE Status_Badge SHALL reflect the current booking status using distinct visual styles: `requested` (amber/yellow), `accepted` (blue), `in_progress` (purple), `completed` (green), `cancelled` (red/gray).
4. WHEN a WS_Event with `event === "booking_update"` and `eventType === "accepted"` is received, THE Booking_List SHALL update the matching Booking_Card's Status_Badge from `requested` to `accepted` without a full page reload.
5. WHEN a WS_Event with `event === "booking_update"` and `eventType === "in_progress"` is received, THE Booking_List SHALL update the matching Booking_Card's Status_Badge to `in_progress`.
6. WHEN a WS_Event with `event === "booking_update"` and `eventType === "completed"` is received, THE Booking_List SHALL update the matching Booking_Card's Status_Badge to `completed`.
7. WHEN a WS_Event with `event === "booking_update"` and `eventType === "cancelled"` is received, THE Booking_List SHALL update the matching Booking_Card's Status_Badge to `cancelled`.
8. IF the `GET /api/bookings` request fails, THEN THE Booking_List SHALL display an error message to the customer.
9. WHILE the initial bookings fetch is in progress, THE Booking_List SHALL display a loading skeleton in place of the booking cards.
10. WHEN the Booking_List has no bookings to display, THE Booking_List SHALL render an empty state message prompting the customer to create their first booking.
11. THE Booking_List SHALL display bookings ordered by `requestedAt` descending (most recent first).

---

### Requirement 3: Customer Booking Status Tracking

**User Story:** As a customer, I want to see a human-readable status label for each booking that reflects the full lifecycle, so that I always know what's happening with my request.

#### Acceptance Criteria

1. THE Status_Badge SHALL map each booking status to a human-readable label: `requested` → "Searching for helper…", `accepted` → "Helper accepted", `in_progress` → "Job in progress", `completed` → "Completed", `cancelled` → "Cancelled".
2. THE Booking_Card SHALL display the `acceptedAt` timestamp when the booking status is `accepted`, `in_progress`, or `completed`.
3. THE Booking_Card SHALL display the `startedAt` timestamp when the booking status is `in_progress` or `completed`.
4. THE Booking_Card SHALL display the `completedAt` timestamp when the booking status is `completed`.
5. WHEN a booking status is `requested`, THE Booking_Card SHALL show an animated pulse indicator alongside the Status_Badge to signal active searching.

---

### Requirement 4: Incoming Jobs Panel — Rich Job Data

**User Story:** As a helper, I want to see full job details (category, address, quoted amount, distance, customer name) in the incoming jobs panel, so that I can make an informed decision to accept or reject.

#### Acceptance Criteria

1. WHEN a WS_Event with `event === "booking_request"` is received, THE Incoming_Jobs_Panel SHALL add a new job entry displaying: booking category, address (addressLine + city), quoted amount in INR, and distance in km (if available from `distanceKm`).
2. THE Incoming_Jobs_Panel SHALL display the customer's name for each incoming job, sourced from the WS event payload or a supplementary API call.
3. THE Incoming_Jobs_Panel SHALL display an expiry countdown timer for each job entry, derived from the `expiresAt` field in the WS event payload.
4. WHEN the expiry countdown reaches zero, THE Incoming_Jobs_Panel SHALL visually mark the job as expired and disable the Accept and Reject buttons for that entry.
5. WHEN the helper clicks Accept on a job entry, THE Incoming_Jobs_Panel SHALL call `POST /api/bookings/[id]/accept` and remove the job entry from the panel on success.
6. WHEN the helper clicks Reject on a job entry, THE Incoming_Jobs_Panel SHALL call `POST /api/bookings/[id]/reject` and remove the job entry from the panel on success.
7. IF `POST /api/bookings/[id]/accept` returns a non-200 response, THEN THE Incoming_Jobs_Panel SHALL display the error message from the response body without removing the job entry.
8. WHILE an Accept or Reject action is in progress for a job entry, THE Incoming_Jobs_Panel SHALL disable both buttons for that entry and show a loading indicator.
9. WHEN the Incoming_Jobs_Panel has no job entries, THE Incoming_Jobs_Panel SHALL render an empty state message indicating no incoming jobs.

---

### Requirement 5: Helper Job History Page

**User Story:** As a helper, I want to see a history of all my accepted, in-progress, completed, and cancelled bookings, so that I can review my past work and track active jobs.

#### Acceptance Criteria

1. WHEN the Job_History_Page loads, THE Job_History_Page SHALL fetch all bookings assigned to the logged-in helper from `GET /api/bookings` and render each as a Job_Card.
2. THE Job_Card SHALL display: booking category, address (addressLine + city), quoted amount in INR, requested date/time, and a Status_Badge.
3. THE Job_History_Page SHALL group Job_Cards into sections: "Active Jobs" (status `accepted` or `in_progress`) and "Past Jobs" (status `completed` or `cancelled`).
4. WHEN the Job_History_Page has no bookings to display, THE Job_History_Page SHALL render an empty state message.
5. IF the `GET /api/bookings` request fails, THEN THE Job_History_Page SHALL display an error message to the helper.
6. WHILE the initial bookings fetch is in progress, THE Job_History_Page SHALL display a loading skeleton.
7. THE Job_History_Page SHALL display bookings ordered by `requestedAt` descending within each section.

---

### Requirement 6: In-Progress and Completion Flow

**User Story:** As a helper, I want Start Job and Complete Job action buttons on my active bookings, so that I can advance the booking through the in-progress and completed states.

#### Acceptance Criteria

1. THE BookingAPI SHALL expose a `POST /api/bookings/[id]/start` route that transitions a booking from `accepted` to `in_progress`, sets `startedAt` to the current timestamp, and publishes a `booking_update` WS event with `eventType: "in_progress"` to both the customer and helper.
2. THE BookingAPI SHALL expose a `POST /api/bookings/[id]/complete` route that transitions a booking from `in_progress` to `completed`, sets `completedAt` to the current timestamp, and publishes a `booking_update` WS event with `eventType: "completed"` to both the customer and helper.
3. IF `POST /api/bookings/[id]/start` is called when the booking status is not `accepted`, THEN THE BookingAPI SHALL return HTTP 400 with a descriptive error message.
4. IF `POST /api/bookings/[id]/complete` is called when the booking status is not `in_progress`, THEN THE BookingAPI SHALL return HTTP 400 with a descriptive error message.
5. IF `POST /api/bookings/[id]/start` or `POST /api/bookings/[id]/complete` is called by a user who is not the assigned helper for that booking, THEN THE BookingAPI SHALL return HTTP 403.
6. WHEN a Job_Card has status `accepted`, THE Job_Card SHALL render a Start_Job_Button.
7. WHEN the helper clicks the Start_Job_Button, THE Job_Card SHALL call `POST /api/bookings/[id]/start` and update the Job_Card's Status_Badge to `in_progress` on success.
8. WHEN a Job_Card has status `in_progress`, THE Job_Card SHALL render a Complete_Job_Button.
9. WHEN the helper clicks the Complete_Job_Button, THE Job_Card SHALL call `POST /api/bookings/[id]/complete` and update the Job_Card's Status_Badge to `completed` on success.
10. IF `POST /api/bookings/[id]/start` or `POST /api/bookings/[id]/complete` returns a non-200 response, THEN THE Job_Card SHALL display the error message from the response body.
11. WHILE a Start_Job_Button or Complete_Job_Button action is in progress, THE Job_Card SHALL disable the action button and show a loading indicator.
12. WHEN a WS_Event with `eventType === "in_progress"` or `eventType === "completed"` is received on the Booking_List, THE Booking_List SHALL update the corresponding Booking_Card's Status_Badge in real-time.
