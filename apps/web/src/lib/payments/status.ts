export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded"
  | "partially_refunded";

const ALLOWED_TRANSITIONS: Record<PaymentStatus, Set<PaymentStatus>> = {
  created: new Set(["authorized", "captured", "failed"]),
  authorized: new Set(["captured", "failed"]),
  captured: new Set(["partially_refunded", "refunded"]),
  // Allow recovery from early verification failure if provider later confirms capture.
  failed: new Set(["captured"]),
  partially_refunded: new Set(["refunded"]),
  refunded: new Set(),
};

export function canTransitionPaymentStatus(
  current: PaymentStatus,
  next: PaymentStatus,
): boolean {
  if (current === next) {
    return false;
  }

  return ALLOWED_TRANSITIONS[current].has(next);
}