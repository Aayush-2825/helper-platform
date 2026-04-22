export type VerificationStatus = "pending" | "approved" | "rejected" | "resubmission_required";

export function computeProfileStatus(docStatuses: string[]): {
  verificationStatus: VerificationStatus;
  isActive: boolean;
  blockResubmission: boolean;
} {
  if (docStatuses.length > 0 && docStatuses.every((status) => status === "approved")) {
    return {
      verificationStatus: "approved",
      isActive: false,
      blockResubmission: false,
    };
  }

  if (docStatuses.some((status) => status === "rejected")) {
    return {
      verificationStatus: "rejected",
      isActive: false,
      blockResubmission: true,
    };
  }

  if (docStatuses.some((status) => status === "resubmission_required")) {
    return {
      verificationStatus: "resubmission_required",
      isActive: false,
      blockResubmission: false,
    };
  }

  return {
    verificationStatus: "pending",
    isActive: false,
    blockResubmission: false,
  };
}
