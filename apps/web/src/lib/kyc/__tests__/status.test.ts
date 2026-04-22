import { describe, expect, it } from "vitest";
import { computeProfileStatus } from "@/lib/kyc/status";

describe("computeProfileStatus", () => {
  it("returns approved with inactive profile and no block when all docs are approved", () => {
    const result = computeProfileStatus(["approved", "approved"]);

    expect(result).toEqual({
      verificationStatus: "approved",
      isActive: false,
      blockResubmission: false,
    });
  });

  it("returns rejected and blocks resubmission when any doc is rejected", () => {
    const result = computeProfileStatus(["approved", "rejected", "pending"]);

    expect(result).toEqual({
      verificationStatus: "rejected",
      isActive: false,
      blockResubmission: true,
    });
  });

  it("returns resubmission_required when any doc needs resubmission and none rejected", () => {
    const result = computeProfileStatus(["approved", "resubmission_required"]);

    expect(result).toEqual({
      verificationStatus: "resubmission_required",
      isActive: false,
      blockResubmission: false,
    });
  });

  it("returns pending when docs are pending/mixed without reject signals", () => {
    const result = computeProfileStatus(["pending", "approved", "pending"]);

    expect(result).toEqual({
      verificationStatus: "pending",
      isActive: false,
      blockResubmission: false,
    });
  });

  it("returns pending for empty doc list", () => {
    const result = computeProfileStatus([]);

    expect(result).toEqual({
      verificationStatus: "pending",
      isActive: false,
      blockResubmission: false,
    });
  });
});
