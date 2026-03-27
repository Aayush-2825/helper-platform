# Booking Dashboard Fixes — Bugfix Design

## Overview

This document formalizes the fix strategy for 18 identified bugs across the booking
platform's WebSocket/realtime layer, API routes, UI components, and dashboard pages.
Each bug is analyzed with a formal bug condition, root cause hypothesis, and concrete
code-level fix. The testing strategy follows the bug-condition methodology: exploratory
tests surface counterexamples on unfixed code, fix-checking tests verify correct behavior
after the fix, and preservation tests confirm no regressions.

---

## Glossary

- **Bug_Condition (C)**: The input condition that triggers the defective behavior.
- **Property (P)**: The correct behavior that must hold when C is true.
- **Preservation**: Behaviors that must remain unchanged by any fix.
- **wsManager**: `apps/web/src/lib/realtime/wsManager.ts` — singleton that holds the
  registered `send` function from `useWebSocket`.
- **wsSend**: The exported function in wsManager that dispatches messages.
- **useWebSocket**: `apps/web/src/hooks/useWebsocket.ts` — hook that owns the raw WS
  connection and registers its `send` into wsManager.
- **useRealtimeEvents**: `apps/web/src/hooks/use-realtime-events.ts` — hook that opens
  its own independent WS connection for receiving events.
- **publishBookingEvent / publishLocationUpdate / publishHelperPresence**: Functions in
  `apps/web/src/lib/realtime/client.ts` that call `wsSend`.
- **COMMISSION_RATE**: The 15% platform fee constant used in earnings calculations.
- **finalAmount**: The authoritative settled amount on a completed booking; may differ
  from `quotedAmount`.

---

## Bug Details

### Bug 1 — WS Messages Dropped Before Socket Initializes

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { fn: "publishBookingEvent" | "publishLocationUpdate" | "publishHelperPresence", args: object }
  OUTPUT: boolean

  RETURN wsSend is called
         AND _send in wsManager is null (useWebSocket has not yet mounted)
END FUNCTION
```

**Root Cause:** `wsManager.ts` stores a single nullable `_send` reference. When
`publishBookingEvent` etc. are called before `useWebSocket` mounts and calls
`registerWsSend`, `_send` is `null` and the message is silently dropped.

**Examples:**
- `publishBookingEvent` called in a server action before the client WS hook mounts → message lost.
- `publishHelperPresence` called on availability page load before WS is ready → presence not broadcast.

---

### Bug 2 — PATCH /api/helper/availability Missing credentials

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type FetchCall
  OUTPUT: boolean

  RETURN input.url === "/api/helper/availability"
         AND input.method === "PATCH"
         AND input.credentials is undefined or "same-origin" (no cookie sent cross-origin)
         AND session cookie is required for auth
END FUNCTION
```

**Root Cause:** `handleStatusChange` in `helper/availability/page.tsx` calls `fetch`
without `credentials: "include"`, so the session cookie is omitted and the route returns
401.

---

### Bug 3 — Reject Action Silently Fails

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { action: "reject", apiResponse: Response }
  OUTPUT: boolean

  RETURN action === "reject"
         AND apiResponse.ok === false
END FUNCTION
```

**Root Cause:** `handleReject` in `IncomingJobsPanel.tsx` only calls `setActionState("idle")`
on non-ok responses with no error state set, so the helper sees no feedback.

---

### Bug 4 — Dual WebSocket Connections

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ComponentTree
  OUTPUT: boolean

  RETURN useWebSocket is mounted (connects to ws://localhost:3001?userId=...)
         AND useRealtimeEvents is also mounted (connects to NEXT_PUBLIC_REALTIME_WS_URL)
         AND both hooks are active simultaneously
END FUNCTION
```

**Root Cause:** `useWebSocket` hardcodes `ws://localhost:3001` while `useRealtimeEvents`
uses `getRealtimeWsUrl()` (env-configurable). Pages that use both hooks open two separate
connections to potentially different servers.

---

### Bug 5 — Review Submission Silently Succeeds on API Failure

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { fetchResult: Response | Error }
  OUTPUT: boolean

  RETURN (fetchResult is a thrown Error)
         OR (fetchResult.ok === false)
END FUNCTION
```

**Root Cause:** `handleSubmit` in `ReviewCard` catches all errors and calls `setSuccess(true)`
unconditionally, and the non-catch path also doesn't check `res.ok` before marking success.

---

### Bug 6 — Payments Page Uses quotedAmount Instead of finalAmount

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type Booking[]
  OUTPUT: boolean

  RETURN any booking in input has status === "completed"
         AND booking.finalAmount !== null
         AND booking.finalAmount !== booking.quotedAmount
END FUNCTION
```

**Root Cause:** `totalPaid` in `CustomerPaymentsPage` uses `b.quotedAmount ?? 0` for
completed bookings instead of `b.finalAmount ?? b.quotedAmount`.

---

### Bug 7 — Inconsistent Commission Rate Between Pages

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { page: "helper-home" | "helper-earnings" }
  OUTPUT: boolean

  RETURN page === "helper-home"
         AND earnings calculated with hardcoded 0.85 multiplier
         AND earnings page uses COMMISSION_RATE = 0.15 constant
END FUNCTION
```

**Root Cause:** `helper/page.tsx` uses `* 0.85` inline while `helper/earnings/page.tsx`
defines `COMMISSION_RATE = 0.15`. If the rate changes, only one file gets updated.

---

### Bug 8 — Amount Displayed Without INR Formatting

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { component: "BookingCard" | "JobCard" | "IncomingJobsPanel" | "HelperHomePage", amount: number }
  OUTPUT: boolean

  RETURN amount is rendered as `₹${amount}` without toLocaleString("en-IN")
         AND amount >= 1000
END FUNCTION
```

**Root Cause:** `BookingCard.tsx`, `JobCard.tsx`, `IncomingJobsPanel.tsx`, and the active
jobs list in `helper/page.tsx` render `₹{booking.quotedAmount}` / `₹{job.quotedAmount}`
without locale formatting.

---

### Bug 9 — Map Helpers Use Fake Index-Based Coordinates

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ApiHelper[]
  OUTPUT: boolean

  RETURN helpers are mapped with lat = userLat + (i - helpers.length/2) * 0.008
         AND lng = userLng + ((i % 3) - 1) * 0.006
         AND no real coordinates exist in the API response
END FUNCTION
```

**Root Cause:** `GET /api/helpers/nearby` does not return lat/lng (helpers don't have
stored coordinates in the DB). The client assigns deterministic offsets based on array
index, which are not real positions.

---

### Bug 10 — booking_update "in_progress" Event Missing startedAt

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type WSEvent
  OUTPUT: boolean

  RETURN input.event === "booking_update"
         AND input.data.eventType === "in_progress"
         AND input.data.startedAt is undefined
END FUNCTION
```

**Root Cause:** `publishBookingEvent` in `client.ts` spreads `input.data` but the callers
in `start/route.ts` do not pass `startedAt` in the event payload — only `eventType` and
IDs are sent.

---

### Bug 11 — handleStart/handleComplete Use Client-Generated Timestamps

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { action: "start" | "complete", apiResponse: { booking: Booking } }
  OUTPUT: boolean

  RETURN action is "start" or "complete"
         AND local state is updated with new Date().toISOString()
         AND apiResponse.booking.startedAt / completedAt is available but ignored
END FUNCTION
```

**Root Cause:** `handleStart` and `handleComplete` in `helper/job-history/page.tsx` set
`startedAt: new Date().toISOString()` / `completedAt: new Date().toISOString()` instead
of using the timestamp from the API response body.

---

### Bug 12 — useWebSocket Reconnect Loop on onMessage Reference Change

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { onMessage: function, callerReRenders: boolean }
  OUTPUT: boolean

  RETURN callerReRenders === true
         AND onMessage is not wrapped in useCallback by the caller
         AND connect is in useEffect dependency array via [connect, send]
         AND connect depends on [userId, onMessage]
END FUNCTION
```

**Root Cause:** `useWebSocket`'s `connect` callback depends on `onMessage`. If the caller
passes an inline function (not memoized), every render creates a new `onMessage` reference,
causing `connect` to change, which triggers the `useEffect` to re-run and open a new
connection.

---

### Bug 13 — Availability Page Silently Ignores Profile Load Failure

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type FetchResult
  OUTPUT: boolean

  RETURN fetchStatus for GET /api/helper/profile fails
         AND catch block is empty (// ignore)
         AND user sees no error, just defaults to "offline"
END FUNCTION
```

**Root Cause:** `fetchStatus` in `helper/availability/page.tsx` has an empty `catch`
block that swallows errors, leaving the helper with no indication that the displayed
status may be wrong.

---

### Bug 14 — BookingForm Re-Populates Category After Reset

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { submissionSuccess: true, defaultCategory: string }
  OUTPUT: boolean

  RETURN form was successfully submitted
         AND setCategoryID("") was called
         AND defaultCategory prop still holds the old value
         AND useEffect([defaultCategory]) fires again setting categoryID back
END FUNCTION
```

**Root Cause:** After a successful submit, `BookingForm` resets `categoryID` to `""` but
the parent `MyMap` still holds `selectedCategory` in state. The `useEffect` watching
`defaultCategory` immediately re-sets `categoryID` to the old value.

---

### Bug 15 — WS Event Batch Only Processes First Event

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type RealtimeMessage[]
  OUTPUT: boolean

  RETURN input.length > 1
         AND only eventMessages[0] is processed
         AND remaining events are ignored in the same render
END FUNCTION
```

**Root Cause:** Both `customer/bookings/page.tsx` and `helper/job-history/page.tsx` read
`eventMessages[0]` and return early, ignoring all other events in the batch.

---

### Bug 16 — Location Broadcasting Stops on Page Unmount

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { helperNavigatesAway: true, bookingStatus: "in_progress" }
  OUTPUT: boolean

  RETURN helper navigates away from /helper/job-history
         AND useHelperLocation is unmounted
         AND geolocation watch is cleared
         AND booking remains in_progress with no location updates
END FUNCTION
```

**Root Cause:** `useHelperLocation` is called inside `HelperJobHistoryPage`. When the
helper navigates away, the component unmounts, the geolocation watch is cleared, and
location updates stop even though the booking is still active.

---

### Bug 17 — GET /api/helpers/nearby Returns Offline/Busy Helpers

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { queryParams: URLSearchParams }
  OUTPUT: boolean

  RETURN route returns helpers with availabilityStatus !== "online"
         AND no status filter is applied server-side
END FUNCTION
```

**Root Cause:** The route queries `where(eq(helperProfile.verificationStatus, "approved"))`
with no filter on `availabilityStatus`, returning all approved helpers regardless of
whether they can accept jobs.

---

### Bug 18 — GET /api/helper/profile Missing bio and headline Fields

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ProfileFetchResult
  OUTPUT: boolean

  RETURN profile query uses explicit columns list
         AND bio and headline are not included in the columns selection
END FUNCTION
```

**Root Cause:** The `columns` object in `db.query.helperProfile.findFirst` in
`api/helper/profile/route.ts` omits `bio` and `headline` (both exist in the schema).

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Valid booking form submissions continue to call `POST /api/bookings` and show success on 201.
- Helper "Accept" on incoming job continues to remove the job from the panel on 200.
- `booking_update` WS event with `eventType === "accepted"` continues to update the customer
  bookings page status badge.
- `POST /api/bookings/[id]/start` continues to return 403 when called by a non-assigned helper.
- `POST /api/bookings/[id]/complete` continues to return 400 when booking is not `in_progress`.
- Availability page continues to call `publishHelperPresence` on successful status update.
- Customer bookings page continues to group bookings into Active and Past sections.
- Helper job history page continues to show Start/Complete buttons on active jobs.
- Incoming jobs panel continues to render the empty state when no jobs exist.
- Expired job countdown continues to disable Accept/Reject buttons.
- `BookingForm` continues to show field-level validation errors without calling the API.

**Scope:** All fixes are surgical — no data model changes, no route restructuring, no
component rewrites. Each fix targets only the specific defective code path.

---

## Correctness Properties

Property 1: Bug Condition — WS Message Delivery Before Socket Ready

_For any_ call to `publishBookingEvent`, `publishLocationUpdate`, or `publishHelperPresence`
that occurs before `useWebSocket` has registered its send function, the system SHALL queue
the message and deliver it once the WebSocket connection is established, rather than
silently dropping it.

**Validates: Requirements 2.1**

---

Property 2: Bug Condition — Availability PATCH Authentication

_For any_ call to `PATCH /api/helper/availability` from the availability page, the request
SHALL include `credentials: "include"` so the session cookie is transmitted and the route
returns 200 instead of 401.

**Validates: Requirements 2.2**

---

Property 3: Bug Condition — Reject Error Feedback

_For any_ reject action where the API returns a non-200 response, the system SHALL display
the error message from the response body and SHALL NOT remove the job from the panel.

**Validates: Requirements 2.3**

---

Property 4: Bug Condition — Single Unified WS Connection

_For any_ page that needs both sending and receiving WebSocket messages, the system SHALL
use a single connection mechanism with a consistent, configurable server URL.

**Validates: Requirements 2.4**

---

Property 5: Bug Condition — Review Submission Error Handling

_For any_ review submission where the API call fails (network error or non-200 response),
the system SHALL display an error message and SHALL NOT mark the review as submitted in
local state.

**Validates: Requirements 2.5**

---

Property 6: Bug Condition — Payments Total Uses finalAmount

_For any_ completed booking where `finalAmount` is non-null, the payments page SHALL use
`finalAmount` (falling back to `quotedAmount`) when computing "Total Paid".

**Validates: Requirements 2.6**

---

Property 7: Bug Condition — Shared Commission Rate Constant

_For any_ earnings calculation on either the helper home page or the helper earnings page,
both pages SHALL reference the same `COMMISSION_RATE` constant so the displayed net
earnings are always consistent.

**Validates: Requirements 2.7**

---

Property 8: Bug Condition — INR Amount Formatting

_For any_ monetary amount rendered in `BookingCard`, `JobCard`, `IncomingJobsPanel`, or
the helper home active jobs list, the amount SHALL be formatted with
`toLocaleString("en-IN")`.

**Validates: Requirements 2.8**

---

Property 9: Bug Condition — Helper Map Coordinates

_For any_ nearby helper returned by `GET /api/helpers/nearby`, the map SHALL use real
coordinates from WS `location_update` events for positioning, with a documented fallback
for helpers that have not yet broadcast a location.

**Validates: Requirements 2.9**

---

Property 10: Bug Condition — booking_update Includes startedAt

_For any_ `booking_update` WS event with `eventType === "in_progress"`, the event payload
SHALL include the `startedAt` timestamp so the booking card can display it.

**Validates: Requirements 2.10**

---

Property 11: Bug Condition — Server Timestamps Used After Start/Complete

_For any_ successful `handleStart` or `handleComplete` call, the local booking state SHALL
be updated with the `startedAt` or `completedAt` timestamp from the API response body.

**Validates: Requirements 2.11**

---

Property 12: Bug Condition — Stable onMessage Reference in useWebSocket

_For any_ re-render of a component that uses `useWebSocket`, the hook SHALL NOT open a
new WebSocket connection unless `userId` changes, by stabilizing the `onMessage` callback
reference internally.

**Validates: Requirements 2.12**

---

Property 13: Bug Condition — Availability Page Load Error Shown

_For any_ failure of `GET /api/helper/profile` on the availability page, the system SHALL
display an error message indicating the status could not be loaded.

**Validates: Requirements 2.13**

---

Property 14: Bug Condition — BookingForm Category Cleared After Submit

_For any_ successful booking form submission, the parent `MyMap` component SHALL reset
`selectedCategory` to `""` so the form does not re-populate with the old category.

**Validates: Requirements 2.14**

---

Property 15: Bug Condition — All WS Events in Batch Processed

_For any_ render where `eventMessages` contains more than one event, the system SHALL
apply all events to the booking list, not just the first.

**Validates: Requirements 2.15**

---

Property 16: Bug Condition — Location Broadcasting Persists Across Navigation

_For any_ helper with an `in_progress` booking who navigates away from the job history
page, the system SHALL continue broadcasting location updates from a layout-level context.

**Validates: Requirements 2.16**

---

Property 17: Bug Condition — Nearby Helpers Filtered by Status

_For any_ call to `GET /api/helpers/nearby`, the route SHALL default to returning only
`online` helpers, with an optional `status` query parameter to override.

**Validates: Requirements 2.17**

---

Property 18: Bug Condition — Helper Profile Returns bio and headline

_For any_ call to `GET /api/helper/profile`, the response SHALL include `bio` and
`headline` fields in addition to the currently returned fields.

**Validates: Requirements 2.18**

---

Property 19: Preservation — All Unchanged Behaviors

_For any_ input that does NOT trigger one of the 18 bug conditions above, the fixed code
SHALL produce exactly the same behavior as the original code, preserving all existing
functionality.

**Validates: Requirements 3.1–3.13**

---

## Fix Implementation

### Fix 1 — WS Message Queue in wsManager

**File:** `apps/web/src/lib/realtime/wsManager.ts`

Add a message queue. When `_send` is null, push to the queue. When `registerWsSend` is
called, flush the queue.

```
// Before
let _send: ((msg: object) => void) | null = null;

export function registerWsSend(fn) { _send = fn; }
export function wsSend(msg) {
  if (!_send) { console.warn(...); return; }
  _send(msg);
}

// After
let _send: ((msg: object) => void) | null = null;
const _queue: object[] = [];

export function registerWsSend(fn) {
  _send = fn;
  while (_queue.length > 0) {
    _send(_queue.shift()!);
  }
}

export function wsSend(msg) {
  if (!_send) { _queue.push(msg); return; }
  _send(msg);
}
```

---

### Fix 2 — Add credentials: "include" to Availability PATCH

**File:** `apps/web/src/app/(portal)/helper/availability/page.tsx`

In `handleStatusChange`, add `credentials: "include"` to the fetch call:

```
// Before
const res = await fetch("/api/helper/availability", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ availabilityStatus: newStatus }),
});

// After
const res = await fetch("/api/helper/availability", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ availabilityStatus: newStatus }),
});
```

---

### Fix 3 — Show Error on Reject Failure

**File:** `apps/web/src/components/IncomingJobsPanel.tsx`

Add a `rejectError` state to the `JobCard` component and set it on non-ok responses:

```
// Add state
const [rejectError, setRejectError] = useState<string | null>(null);

// In handleReject, replace the else branch:
} else {
  let message = "Failed to reject job.";
  try {
    const body = await res.json();
    if (body?.message) message = body.message;
  } catch { /* ignore */ }
  setRejectError(message);
  setActionState("idle");
}

// In catch:
} catch {
  setRejectError("Network error. Please try again.");
  setActionState("idle");
}

// In JSX, render below acceptError:
{rejectError && <div className="text-sm text-destructive">{rejectError}</div>}
```

---

### Fix 4 — Unify WebSocket Connection

**File:** `apps/web/src/hooks/useWebsocket.ts`

Replace the hardcoded `ws://localhost:3001` URL with `getRealtimeWsUrl()` from the
realtime client, so both hooks connect to the same server:

```
// Before
const ws = new WebSocket(`ws://localhost:3001?userId=${userId}`);

// After
import { getRealtimeWsUrl } from "@/lib/realtime/client";
const wsUrl = new URL(getRealtimeWsUrl());
wsUrl.searchParams.set("userId", userId);
const ws = new WebSocket(wsUrl.toString());
```

---

### Fix 5 — Review Submission Error Handling

**File:** `apps/web/src/app/(portal)/customer/reviews/page.tsx`

Add an `error` state to `ReviewCard`. Check `res.ok` before marking success. Do not
call `setSuccess(true)` in the catch block:

```
const [error, setError] = useState<string | null>(null);

async function handleSubmit() {
  if (rating === 0) return;
  setSubmitting(true);
  setError(null);
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bookingId: booking.id, rating, comment }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.message ?? "Failed to submit review. Please try again.");
      return;
    }
    setSuccess(true);
    onSubmit(booking.id, rating, comment);
  } catch {
    setError("Network error. Please try again.");
  } finally {
    setSubmitting(false);
  }
}

// In JSX, render error below the submit button:
{error && <p className="text-sm text-destructive">{error}</p>}
```

---

### Fix 6 — Payments Page Use finalAmount

**File:** `apps/web/src/app/(portal)/customer/payments/page.tsx`

Change the `totalPaid` calculation and the per-row amount display:

```
// Before
const totalPaid = completed.reduce((sum, b) => sum + (b.quotedAmount ?? 0), 0);

// After
const totalPaid = completed.reduce((sum, b) => sum + (b.finalAmount ?? b.quotedAmount ?? 0), 0);
```

Also update the `Booking` type import to include `finalAmount?: number | null` if not
already present (it is not in the current `BookingCard.tsx` type — add it).

For the per-row display in the transaction list:
```
// Before
<span className="text-sm font-semibold">₹{booking.quotedAmount.toLocaleString("en-IN")}</span>

// After
<span className="text-sm font-semibold">
  ₹{(booking.finalAmount ?? booking.quotedAmount).toLocaleString("en-IN")}
</span>
```

---

### Fix 7 — Shared Commission Rate Constant

**File:** `apps/web/src/lib/constants.ts` (create if not exists)

```typescript
export const COMMISSION_RATE = 0.15;
```

**File:** `apps/web/src/app/(portal)/helper/page.tsx`

```
// Before
const totalNet = completedJobs.reduce((sum, b) => sum + Math.round((b.finalAmount ?? b.quotedAmount) * 0.85), 0);

// After
import { COMMISSION_RATE } from "@/lib/constants";
const totalNet = completedJobs.reduce(
  (sum, b) => sum + Math.round((b.finalAmount ?? b.quotedAmount) * (1 - COMMISSION_RATE)),
  0
);
```

**File:** `apps/web/src/app/(portal)/helper/earnings/page.tsx`

Replace the local `const COMMISSION_RATE = 0.15` with the shared import.

---

### Fix 8 — INR Formatting in BookingCard, JobCard, IncomingJobsPanel, HelperHome

**File:** `apps/web/src/components/BookingCard.tsx`
```
// Before
<div className="text-sm font-medium">₹{booking.quotedAmount}</div>

// After
<div className="text-sm font-medium">₹{booking.quotedAmount.toLocaleString("en-IN")}</div>
```

**File:** `apps/web/src/components/JobCard.tsx`
```
// Before
<div className="text-sm font-medium">₹{booking.quotedAmount}</div>

// After
<div className="text-sm font-medium">₹{booking.quotedAmount.toLocaleString("en-IN")}</div>
```

**File:** `apps/web/src/components/IncomingJobsPanel.tsx`
```
// Before
<div className="text-sm font-semibold">₹{job.quotedAmount}</div>

// After
<div className="text-sm font-semibold">₹{job.quotedAmount.toLocaleString("en-IN")}</div>
```

**File:** `apps/web/src/app/(portal)/helper/page.tsx` (active jobs quick view)
```
// Before
<span className="text-sm">₹{b.quotedAmount}</span>

// After
<span className="text-sm">₹{b.quotedAmount.toLocaleString("en-IN")}</span>
```

---

### Fix 9 — Map Helper Coordinates

The DB has no stored lat/lng for helpers. The fix is two-part:

1. **Document the limitation** — the initial placement uses deterministic offsets (current
   behavior) as a placeholder until a real location arrives via WS.
2. **Ensure WS location_update replaces the placeholder** — this already works via the
   `useRealtimeEvents` effect in `map-component.tsx`. No code change needed for the WS
   update path.
3. **Optional server-side improvement** — if real coordinates are needed at load time,
   the realtime server's location repository could be queried via HTTP. This is out of
   scope for a minimal fix; document the placeholder behavior instead.

The minimal fix is to add a comment in `map-component.tsx` clarifying the placeholder
behavior and ensure the WS update path is correct (it already is).

---

### Fix 10 — publishBookingEvent Includes startedAt/completedAt

**File:** `apps/web/src/app/api/bookings/[id]/start/route.ts`

Pass `startedAt` in the event data:
```
publishBookingEvent({
  bookingId,
  customerId: existingBooking.customerId,
  helperId: session.user.id,
  eventType: "in_progress",
  data: { startedAt: updatedRows[0].startedAt?.toISOString() },
});
```

**File:** `apps/web/src/app/api/bookings/[id]/complete/route.ts`

Pass `completedAt` in the event data:
```
publishBookingEvent({
  bookingId,
  customerId: existingBooking.customerId,
  helperId: session.user.id,
  eventType: "completed",
  data: { completedAt: updatedRows[0].completedAt?.toISOString() },
});
```

**File:** `apps/web/src/lib/realtime/client.ts`

The `publishBookingEvent` function already spreads `...input.data` into the WS message,
so the timestamps will be included automatically.

---

### Fix 11 — Use Server Timestamps in handleStart/handleComplete

**File:** `apps/web/src/app/(portal)/helper/job-history/page.tsx`

```
// handleStart — Before
setBookings((prev) =>
  prev.map((b) =>
    b.id === id ? { ...b, status: "in_progress", startedAt: new Date().toISOString() } : b
  )
);

// handleStart — After
const data = await res.json() as { booking: Booking };
setBookings((prev) =>
  prev.map((b) =>
    b.id === id ? { ...b, status: "in_progress", startedAt: data.booking.startedAt } : b
  )
);

// handleComplete — Before
setBookings((prev) =>
  prev.map((b) =>
    b.id === id ? { ...b, status: "completed", completedAt: new Date().toISOString() } : b
  )
);

// handleComplete — After
const data = await res.json() as { booking: Booking };
setBookings((prev) =>
  prev.map((b) =>
    b.id === id ? { ...b, status: "completed", completedAt: data.booking.completedAt } : b
  )
);
```

---

### Fix 12 — Stabilize onMessage in useWebSocket

**File:** `apps/web/src/hooks/useWebsocket.ts`

Store `onMessage` in a ref so `connect` does not depend on it directly:

```
const onMessageRef = useRef(onMessage);
useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

// In connect, use the ref:
ws.onmessage = (event) => {
  try {
    const data: WSMessage = JSON.parse(event.data);
    onMessageRef.current(data);
  } catch {
    console.warn("[WS] Invalid message");
  }
};

// Remove onMessage from connect's dependency array:
const connect = useCallback(() => {
  // ...
}, [userId]); // only userId, not onMessage
```

---

### Fix 13 — Show Error When Profile Load Fails

**File:** `apps/web/src/app/(portal)/helper/availability/page.tsx`

Add a `loadError` state and set it in the catch block:

```
const [loadError, setLoadError] = useState<string | null>(null);

// In fetchStatus catch:
} catch {
  setLoadError("Could not load your current status. Please refresh to try again.");
} finally {
  setLoading(false);
}

// Also handle non-ok responses:
if (!res.ok) {
  setLoadError("Could not load your current status. Please refresh to try again.");
  return;
}

// In JSX, render below the loading check:
{loadError && (
  <p className="text-sm text-destructive">{loadError}</p>
)}
```

---

### Fix 14 — Reset selectedCategory in MyMap After Submit

**File:** `apps/web/src/components/map-component.tsx`

Pass an `onSuccess` callback to `BookingForm` that resets `selectedCategory`:

```
// In MyMap, pass a reset callback:
<BookingForm
  latitude={draggableMarker.lat}
  longitude={draggableMarker.lng}
  defaultCategory={selectedCategory}
  formRef={formRef}
  onSuccess={() => setSelectedCategory("")}
/>
```

**File:** `apps/web/src/components/BookingForm.tsx`

Add `onSuccess?: () => void` to `BookingFormProps` and call it after the internal reset:

```
// In handleSubmit, after the internal resets:
if (res.status === 201) {
  setSuccessMessage("Booking created successfully!");
  setCategoryID("");
  setAddressLine("");
  // ... other resets ...
  onSuccess?.();
}
```

---

### Fix 15 — Process All WS Events in Batch

**File:** `apps/web/src/app/(portal)/customer/bookings/page.tsx`
**File:** `apps/web/src/app/(portal)/helper/job-history/page.tsx`

Replace the single-event processing with a loop over all events:

```
// Before
useEffect(() => {
  if (eventMessages.length === 0) return;
  const latest = eventMessages[0];
  if (latest.type !== "event" || latest.event !== "booking_update") return;
  // ... process latest ...
}, [eventMessages]);

// After
useEffect(() => {
  if (eventMessages.length === 0) return;
  setBookings((prev) => {
    let next = [...prev];
    for (const msg of eventMessages) {
      if (msg.type !== "event" || msg.event !== "booking_update") continue;
      const data = msg.data as BookingUpdateEventData | undefined;
      if (!data?.bookingId) continue;
      const newStatus = statusMap[data.eventType];
      if (!newStatus) continue;
      next = next.map((b) => {
        if (b.id !== data.bookingId) return b;
        return {
          ...b,
          status: newStatus,
          ...(data.acceptedAt ? { acceptedAt: data.acceptedAt } : {}),
          ...(data.startedAt ? { startedAt: data.startedAt } : {}),
          ...(data.completedAt ? { completedAt: data.completedAt } : {}),
        };
      });
    }
    return next;
  });
}, [eventMessages]);
```

---

### Fix 16 — Persist Location Broadcasting in Helper Layout

**File:** `apps/web/src/app/(portal)/helper/layout.tsx`

Move `useHelperLocation` to the layout so it persists across page navigation. The layout
needs to fetch active bookings to know if there is an `in_progress` job:

```
// In HelperLayout, add:
import { useHelperLocation } from "@/hooks/useHelperLocation";
import { useSession } from "@/lib/auth/session";
import { useEffect, useState } from "react";

// Fetch active booking ID at layout level
const { session } = useSession();
const [inProgressBookingId, setInProgressBookingId] = useState<string | undefined>();

useEffect(() => {
  fetch("/api/bookings", { credentials: "include" })
    .then((r) => r.json())
    .then((data: { bookings?: Array<{ id: string; status: string }> }) => {
      const active = data.bookings?.find((b) => b.status === "in_progress");
      setInProgressBookingId(active?.id);
    })
    .catch(() => {});
}, []);

useHelperLocation(session?.user.id, inProgressBookingId, !!inProgressBookingId);
```

Remove `useHelperLocation` from `helper/job-history/page.tsx` to avoid double-watching.

---

### Fix 17 — Filter Nearby Helpers by availabilityStatus

**File:** `apps/web/src/app/api/helpers/nearby/route.ts`

Add an optional `status` query parameter defaulting to `"online"`:

```
import { and, eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // ...auth check...

  const { searchParams } = request.nextUrl;
  const statusParam = searchParams.get("status"); // "online" | "offline" | "busy" | "all"

  const statusFilter =
    statusParam === "all"
      ? undefined
      : eq(helperProfile.availabilityStatus, (statusParam ?? "online") as "online" | "offline" | "busy");

  const helpers = await db
    .select({ ... })
    .from(helperProfile)
    .innerJoin(user, eq(helperProfile.userId, user.id))
    .where(
      statusFilter
        ? and(eq(helperProfile.verificationStatus, "approved"), statusFilter)
        : eq(helperProfile.verificationStatus, "approved")
    );
  // ...
}
```

Also fix the unused `request` parameter warning by using `request.nextUrl`.

---

### Fix 18 — Add bio and headline to Profile GET Response

**File:** `apps/web/src/app/api/helper/profile/route.ts`

Add `bio` and `headline` to the `columns` selection:

```
// Before
columns: {
  id: true,
  primaryCategory: true,
  availabilityStatus: true,
  verificationStatus: true,
  serviceCity: true,
  yearsExperience: true,
  averageRating: true,
  completedJobs: true,
},

// After
columns: {
  id: true,
  primaryCategory: true,
  availabilityStatus: true,
  verificationStatus: true,
  serviceCity: true,
  yearsExperience: true,
  averageRating: true,
  completedJobs: true,
  bio: true,
  headline: true,
},
```

---

## Hypothesized Root Causes (Summary)

| Bug | Root Cause Category |
|-----|---------------------|
| 1 | Missing message queue in singleton wsManager |
| 2 | Missing `credentials: "include"` on fetch |
| 3 | Missing error state for reject action |
| 4 | Hardcoded WS URL in useWebSocket vs env-configurable URL in useRealtimeEvents |
| 5 | Unconditional `setSuccess(true)` in catch block |
| 6 | Wrong field (`quotedAmount` vs `finalAmount`) in reduce |
| 7 | Duplicated magic number `0.85` instead of shared constant |
| 8 | Missing `.toLocaleString("en-IN")` on amount renders |
| 9 | No real coordinates in DB; placeholder offsets not documented |
| 10 | `publishBookingEvent` callers don't pass timestamps in `data` |
| 11 | `new Date().toISOString()` used instead of API response timestamp |
| 12 | `onMessage` not stabilized via ref, causing `connect` to change on re-render |
| 13 | Empty catch block swallows profile load errors |
| 14 | Parent `selectedCategory` state not reset after form submit |
| 15 | `eventMessages[0]` only — no loop over batch |
| 16 | `useHelperLocation` scoped to page component, not layout |
| 17 | No `availabilityStatus` filter in nearby helpers query |
| 18 | `bio` and `headline` omitted from explicit columns list |

---

## Testing Strategy

### Validation Approach

Two-phase approach: (1) exploratory tests run on unfixed code to surface counterexamples
and confirm root causes; (2) fix-checking and preservation tests run on fixed code.

---

### Exploratory Bug Condition Checking

**Goal:** Surface counterexamples that demonstrate each bug on unfixed code.

**Test Cases:**

1. **WS Queue (Bug 1):** Call `wsSend` before `registerWsSend` is called. Assert the
   message is dropped (counterexample: no delivery). After fix, assert delivery.

2. **Availability 401 (Bug 2):** Mock `fetch` and assert `credentials` is absent on the
   PATCH call. After fix, assert `credentials: "include"` is present.

3. **Reject Error (Bug 3):** Mock reject API to return 400. Assert no error message is
   shown (counterexample). After fix, assert error message is rendered.

4. **Dual WS (Bug 4):** Mount both hooks and assert two WebSocket constructors are called
   with different URLs. After fix, assert same URL.

5. **Review Silent Success (Bug 5):** Mock `fetch` to throw. Assert `success` state is
   true (counterexample). After fix, assert error message is shown.

6. **Payments finalAmount (Bug 6):** Provide a completed booking with `finalAmount` ≠
   `quotedAmount`. Assert total uses `quotedAmount` (counterexample). After fix, assert
   `finalAmount` is used.

7. **Commission Rate (Bug 7):** Assert helper home and earnings page produce different
   net values for the same booking when rate changes (counterexample). After fix, assert
   same value.

8. **INR Format (Bug 8):** Render a booking with `quotedAmount = 1200`. Assert output is
   `₹1200` without comma (counterexample). After fix, assert `₹1,200`.

9. **Map Coordinates (Bug 9):** Fetch nearby helpers and assert all markers have
   index-derived positions (document as known limitation).

10. **startedAt in WS (Bug 10):** Capture the WS message sent by `publishBookingEvent`
    after start. Assert `startedAt` is absent (counterexample). After fix, assert present.

11. **Client Timestamp (Bug 11):** Call `handleStart`, assert `startedAt` in state is
    close to `Date.now()` but not equal to server response (counterexample). After fix,
    assert server value is used.

12. **Reconnect Loop (Bug 12):** Render component with unstable `onMessage`. Assert
    multiple WS connections are opened (counterexample). After fix, assert only one.

13. **Profile Load Error (Bug 13):** Mock profile fetch to fail. Assert no error UI is
    shown (counterexample). After fix, assert error message is rendered.

14. **Form Re-populate (Bug 14):** Submit form, assert `categoryID` resets to `""` then
    immediately re-populates (counterexample). After fix, assert it stays `""`.

15. **Batch Events (Bug 15):** Deliver two simultaneous `booking_update` events. Assert
    only the first is applied (counterexample). After fix, assert both are applied.

16. **Location on Navigate (Bug 16):** Mount job history page with in_progress booking,
    navigate away, assert `clearWatch` is called and no more updates sent (counterexample).
    After fix, assert updates continue from layout.

17. **Offline Helpers (Bug 17):** Call `GET /api/helpers/nearby` and assert offline
    helpers are returned (counterexample). After fix, assert only online helpers returned
    by default.

18. **Missing Profile Fields (Bug 18):** Call `GET /api/helper/profile` and assert `bio`
    is absent from response (counterexample). After fix, assert `bio` and `headline` are
    present.

---

### Fix Checking

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedFunction(input)
  ASSERT expectedBehavior(result)
END FOR
```

Each fix-checking test corresponds directly to one of the 18 properties above.

---

### Preservation Checking

**Goal:** Verify that inputs not matching any bug condition produce identical behavior
before and after the fix.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Property-based testing is recommended for:**
- Bug 1: Generate random message types and assert all are delivered after WS is ready.
- Bug 6: Generate random `finalAmount`/`quotedAmount` pairs and assert correct total.
- Bug 8: Generate random amounts and assert locale formatting is always applied.
- Bug 15: Generate random-length event batches and assert all are applied.

**Test Cases:**
1. **Accept still works (Bug 3 preservation):** Accept action on non-error response still
   removes job from panel.
2. **Booking form validation (Bug 14 preservation):** Invalid form still shows errors
   without calling API.
3. **Active/Past grouping (Bug 15 preservation):** Bookings page still groups correctly
   after batch event processing.
4. **Availability success (Bug 2 preservation):** Successful PATCH still calls
   `publishHelperPresence`.
5. **Review display (Bug 5 preservation):** Already-submitted reviews still display
   correctly.

---

### Unit Tests

- `wsManager`: queue behavior, flush on register, normal send when registered.
- `handleStatusChange`: credentials present, error shown on failure, success calls presence.
- `handleReject`: error state set on non-ok, job not removed on error.
- `ReviewCard.handleSubmit`: error shown on non-ok, success only on 200.
- `CustomerPaymentsPage`: `totalPaid` uses `finalAmount ?? quotedAmount`.
- `HelperHomePage` / `HelperEarningsPage`: same net value for same booking.
- `BookingCard` / `JobCard` / `IncomingJobsPanel`: amounts formatted with `en-IN`.
- `publishBookingEvent` callers: `startedAt`/`completedAt` present in WS payload.
- `handleStart` / `handleComplete`: server timestamp used in state update.
- `useWebSocket`: single connection on re-render with unstable `onMessage`.
- `GET /api/helpers/nearby`: returns only online helpers by default; respects `status` param.
- `GET /api/helper/profile`: response includes `bio` and `headline`.

### Property-Based Tests

- For any sequence of WS messages sent before socket ready, all are delivered after connect.
- For any completed booking, `totalPaid` equals sum of `finalAmount ?? quotedAmount`.
- For any monetary amount, rendered string equals `₹${amount.toLocaleString("en-IN")}`.
- For any batch of N booking_update events, all N are applied to state.

### Integration Tests

- Full availability flow: load page → see current status → change status → 200 response →
  presence broadcast → no 401.
- Full review flow: submit review → API error → error shown → retry → success → "Thanks".
- Full job start flow: click Start → API returns `startedAt` → card shows server timestamp.
- Full booking form flow: select helper → fill form → submit → form clears → category
  does not re-populate.
- Nearby helpers map: only online helpers shown on initial load; offline helper appears
  after sending `location_update` WS event.
