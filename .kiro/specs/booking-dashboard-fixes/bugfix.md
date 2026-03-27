# Bugfix Requirements Document

## Introduction

This document captures all identified bugs, gaps, and flaws across the booking flow, customer dashboard, and helper dashboard of the web application. Issues span multiple layers: the WebSocket infrastructure, API routes, UI components, and real-time event handling. The bugs range from silent data loss (WS messages dropped before the socket is initialized) to incorrect authorization checks (start/complete routes check `helperId` against `session.user.id` but the booking stores the user ID, not the profile ID), to UX gaps (review submissions silently succeed even on API failure, no error feedback on reject action, hardcoded localhost WS URL in `useWebSocket`).

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `publishBookingEvent`, `publishLocationUpdate`, or `publishHelperPresence` is called before `useWebSocket` has mounted and registered its send function THEN the system silently drops the message with only a console warning and the event is never delivered

1.2 WHEN the helper availability page calls `PATCH /api/helper/availability` THEN the system sends the request without credentials, causing the session cookie to be omitted and the route to return 401 Unauthorized

1.3 WHEN a helper clicks "Reject" on an incoming job and the API returns a non-200 response THEN the system silently resets the action state with no error message shown to the helper

1.4 WHEN `useWebSocket` is used alongside `useRealtimeEvents` in the same application THEN the system creates two separate WebSocket connections to two different URLs (`ws://localhost:3001` hardcoded vs the configurable realtime server), causing duplicate connections and potential message routing conflicts

1.5 WHEN the customer reviews page submits a review and the `POST /api/reviews` call throws a network error or returns a non-200 response THEN the system marks the review as successfully submitted in local state and shows "Thanks for your feedback!" despite the review not being persisted

1.6 WHEN the customer payments page calculates "Total Paid" THEN the system uses `quotedAmount` for completed bookings instead of `finalAmount`, causing the displayed total to be incorrect when a final amount differs from the quoted amount

1.7 WHEN the helper earnings page and helper home page calculate net earnings THEN the system uses `quotedAmount` for pending jobs and `finalAmount ?? quotedAmount` for completed jobs inconsistently, and the helper home page hardcodes `* 0.85` while the earnings page uses `COMMISSION_RATE = 0.15`, creating a risk of divergence if the rate changes

1.8 WHEN the `BookingCard` or `JobCard` renders `quotedAmount` THEN the system displays the raw number without `toLocaleString("en-IN")` formatting, causing amounts like 1200 to appear as "₹1200" instead of "₹1,200"

1.9 WHEN the map component fetches nearby helpers via `GET /api/helpers/nearby` THEN the system assigns deterministic fake lat/lng offsets based on array index rather than real coordinates, causing helper markers to appear at incorrect positions that do not reflect actual helper locations

1.10 WHEN the `useRealtimeEvents` hook receives a `booking_update` event with `eventType === "in_progress"` THEN the system does not update the `startedAt` timestamp on the booking card because the API response's `startedAt` is not included in the WS event payload published by `publishBookingEvent`

1.11 WHEN the helper job history page calls `handleStart` or `handleComplete` and the API succeeds THEN the system updates local state with a client-generated `new Date().toISOString()` timestamp instead of the authoritative server timestamp returned in the API response, causing potential clock skew

1.12 WHEN the `useWebSocket` hook's `connect` function is called and the component re-renders due to `onMessage` callback reference changing THEN the system creates a new WebSocket connection because `onMessage` is not stable (not wrapped in `useCallback` by callers), causing reconnect loops

1.13 WHEN the helper availability page loads and the `GET /api/helper/profile` fetch fails THEN the system silently ignores the error and defaults to "offline" status with no indication to the helper that the current status could not be loaded

1.14 WHEN the `BookingForm` is reset after a successful submission THEN the system resets `categoryID` to an empty string but the `defaultCategory` prop still holds the previously selected helper's category, causing the form to re-populate with the old category on the next render cycle via the `useEffect` that watches `defaultCategory`

1.15 WHEN the customer bookings page or helper job history page receives a `booking_update` WS event THEN the system only processes `eventMessages[0]` (the latest event) and ignores all others in the same render batch, causing missed updates when multiple events arrive simultaneously

1.16 WHEN the `useHelperLocation` hook is active and the helper navigates away from the job history page THEN the system stops broadcasting location updates because the geolocation watch is cleared on unmount, but the booking remains `in_progress` with no location data being sent

1.17 WHEN the `GET /api/helpers/nearby` route is called THEN the system returns all approved helpers regardless of their `availabilityStatus`, including offline and busy helpers, causing the map to show helpers who cannot accept new jobs without any server-side filtering option

1.18 WHEN the helper profile `GET /api/helper/profile` route is called THEN the system does not return the helper's `bio`, `phoneNumber`, or other profile fields that may be needed by the availability and dashboard pages

---

### Expected Behavior (Correct)

2.1 WHEN `publishBookingEvent`, `publishLocationUpdate`, or `publishHelperPresence` is called before the WebSocket is initialized THEN the system SHALL queue the message and deliver it once the WebSocket connection is established, or surface a clear error rather than silently dropping it

2.2 WHEN the helper availability page calls `PATCH /api/helper/availability` THEN the system SHALL include `credentials: "include"` in the fetch options so the session cookie is sent and the request is authenticated

2.3 WHEN a helper clicks "Reject" on an incoming job and the API returns a non-200 response THEN the system SHALL display the error message from the response body to the helper without removing the job entry

2.4 WHEN the application needs a WebSocket connection THEN the system SHALL use a single unified connection mechanism (either `useWebSocket` or `useRealtimeEvents`) with a consistent, configurable server URL rather than two separate hooks connecting to different hardcoded endpoints

2.5 WHEN the customer reviews page submits a review and the API call fails THEN the system SHALL display an error message to the customer and SHALL NOT mark the review as submitted in local state

2.6 WHEN the customer payments page calculates "Total Paid" THEN the system SHALL use `finalAmount ?? quotedAmount` for completed bookings to reflect the actual charged amount

2.7 WHEN the helper earnings page and helper home page calculate net earnings THEN the system SHALL reference a single shared commission rate constant so both pages always display consistent figures

2.8 WHEN `BookingCard` or `JobCard` renders `quotedAmount` THEN the system SHALL format the amount using `toLocaleString("en-IN")` for consistent INR display

2.9 WHEN the map component assigns positions to nearby helpers THEN the system SHALL use real coordinates from the database or WS location updates rather than deterministic index-based offsets for initial placement

2.10 WHEN a `booking_update` WS event with `eventType === "in_progress"` is received THEN the system SHALL update the `startedAt` field on the matching booking card using the timestamp from the event payload

2.11 WHEN `handleStart` or `handleComplete` succeeds THEN the system SHALL update local booking state with the `startedAt` or `completedAt` timestamp returned in the API response body rather than a client-generated timestamp

2.12 WHEN the `useWebSocket` hook's `connect` function is called THEN the system SHALL stabilize the `onMessage` callback reference so that re-renders do not trigger reconnection loops

2.13 WHEN the helper availability page fails to load the current status from `GET /api/helper/profile` THEN the system SHALL display an error message indicating the status could not be loaded and prompt the helper to retry

2.14 WHEN the `BookingForm` is reset after a successful submission THEN the system SHALL also clear the `defaultCategory` selection state in the parent `MyMap` component so the form does not re-populate with the previously selected category

2.15 WHEN the customer bookings page or helper job history page receives WS events THEN the system SHALL process all events in the batch rather than only the first element, applying each update to the corresponding booking in state

2.16 WHEN the helper navigates away from the job history page while a booking is `in_progress` THEN the system SHALL continue broadcasting location updates from a persistent context (e.g. a layout-level hook) rather than stopping on page unmount

2.17 WHEN the `GET /api/helpers/nearby` route is called THEN the system SHALL support an optional `status` query parameter to filter helpers by `availabilityStatus`, defaulting to returning only `online` helpers

2.18 WHEN the helper profile `GET /api/helper/profile` route is called THEN the system SHALL return all profile fields needed by the dashboard, including `bio` and `phoneNumber` if present in the schema

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid booking form is submitted with all required fields THEN the system SHALL CONTINUE TO call `POST /api/bookings` and display a success message on 201 response

3.2 WHEN a helper clicks "Accept" on an incoming job and the API returns 200 THEN the system SHALL CONTINUE TO remove the job entry from the incoming jobs panel

3.3 WHEN a `booking_update` WS event with `eventType === "accepted"` is received on the customer bookings page THEN the system SHALL CONTINUE TO update the matching booking's status badge to "Helper accepted"

3.4 WHEN a helper clicks "Start Job" on an accepted booking THEN the system SHALL CONTINUE TO call `POST /api/bookings/[id]/start` and update the job card status to `in_progress` on success

3.5 WHEN a helper clicks "Complete Job" on an in-progress booking THEN the system SHALL CONTINUE TO call `POST /api/bookings/[id]/complete` and update the job card status to `completed` on success

3.6 WHEN `POST /api/bookings/[id]/start` is called by a user who is not the assigned helper THEN the system SHALL CONTINUE TO return HTTP 403

3.7 WHEN `POST /api/bookings/[id]/complete` is called when the booking is not `in_progress` THEN the system SHALL CONTINUE TO return HTTP 400 with a descriptive error message

3.8 WHEN the helper availability page successfully updates status THEN the system SHALL CONTINUE TO call `publishHelperPresence` to broadcast the new status via WebSocket

3.9 WHEN the customer bookings page loads THEN the system SHALL CONTINUE TO display bookings grouped into "Active" and "Past" sections ordered by `requestedAt` descending

3.10 WHEN the helper job history page loads THEN the system SHALL CONTINUE TO display bookings grouped into "Active Jobs" and "Past Jobs" sections with Start/Complete action buttons on active jobs

3.11 WHEN the incoming jobs panel has no jobs THEN the system SHALL CONTINUE TO render the empty state message

3.12 WHEN an incoming job's expiry countdown reaches zero THEN the system SHALL CONTINUE TO visually mark the job as expired and disable the Accept and Reject buttons

3.13 WHEN the `BookingForm` has invalid or missing required fields on submit THEN the system SHALL CONTINUE TO display field-level validation errors without calling the API
