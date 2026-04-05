import { describe, expect, it } from "vitest";
import {
  canTransitionPayoutStatus,
  payoutStatusRequiresFailureReason,
  payoutStatusRequiresTransferReference,
  type PayoutStatus,
} from "../transitions";

describe("payout transition policy", () => {
  const statuses: PayoutStatus[] = ["pending", "processing", "paid", "failed", "reversed"];

  it("allows only configured transitions", () => {
    expect(canTransitionPayoutStatus("pending", "processing")).toBe(true);
    expect(canTransitionPayoutStatus("pending", "failed")).toBe(true);
    expect(canTransitionPayoutStatus("processing", "paid")).toBe(true);

    expect(canTransitionPayoutStatus("pending", "paid")).toBe(false);
    expect(canTransitionPayoutStatus("processing", "pending")).toBe(false);
    expect(canTransitionPayoutStatus("paid", "failed")).toBe(false);
    expect(canTransitionPayoutStatus("failed", "reversed")).toBe(false);
  });

  it("requires transfer reference only for paid", () => {
    for (const status of statuses) {
      expect(payoutStatusRequiresTransferReference(status)).toBe(status === "paid");
    }
  });

  it("requires failure reason for failed/reversed only", () => {
    for (const status of statuses) {
      const expected = status === "failed" || status === "reversed";
      expect(payoutStatusRequiresFailureReason(status)).toBe(expected);
    }
  });
});
