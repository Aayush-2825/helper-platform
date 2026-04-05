export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "reversed";

const ALLOWED_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  pending: ["processing", "failed", "reversed"],
  processing: ["paid", "failed", "reversed"],
  paid: [],
  failed: [],
  reversed: [],
};

export function canTransitionPayoutStatus(from: PayoutStatus, to: PayoutStatus) {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function payoutStatusRequiresFailureReason(status: PayoutStatus) {
  return status === "failed" || status === "reversed";
}

export function payoutStatusRequiresTransferReference(status: PayoutStatus) {
  return status === "paid";
}
