export type BookingLifecycleStatus =
  | "requested"
  | "matched"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired"
  | "disputed";

const MATCHABLE_STATUSES: BookingLifecycleStatus[] = ["requested", "matched"];
const CUSTOMER_CANCELLABLE_STATUSES: BookingLifecycleStatus[] = ["requested", "matched", "accepted"];
const TERMINAL_STATUSES: BookingLifecycleStatus[] = ["completed", "cancelled", "expired", "disputed"];

export function isMatchableBookingStatus(status: string): status is BookingLifecycleStatus {
  return MATCHABLE_STATUSES.includes(status as BookingLifecycleStatus);
}

export function isCustomerCancellableBookingStatus(status: string): status is BookingLifecycleStatus {
  return CUSTOMER_CANCELLABLE_STATUSES.includes(status as BookingLifecycleStatus);
}

export function isTerminalBookingStatus(status: string): status is BookingLifecycleStatus {
  return TERMINAL_STATUSES.includes(status as BookingLifecycleStatus);
}
