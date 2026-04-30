import { NextResponse } from "next/server";

export type HelperActivationGateReason =
  | "helper_profile_missing"
  | "verification_status_not_approved"
  | "video_kyc_not_passed"
  | "helper_not_active";

export type ActivationGateProfile = {
  verificationStatus: "pending" | "approved" | "rejected" | "resubmission_required";
  videoKycStatus: "not_required" | "pending_schedule" | "scheduled" | "passed" | "failed";
  isActive: boolean;
};

export function evaluateHelperActivationGate(profile: ActivationGateProfile | null) {
  if (!profile) {
    return {
      ok: false as const,
      reason: "helper_profile_missing" as const,
      message: "Helper profile not found.",
    };
  }

  if (profile.verificationStatus !== "approved") {
    return {
      ok: false as const,
      reason: "verification_status_not_approved" as const,
      message: "Documents are not approved yet.",
    };
  }

  if (profile.videoKycStatus !== "passed") {
    return {
      ok: false as const,
      reason: "video_kyc_not_passed" as const,
      message: "Video KYC is not passed yet.",
    };
  }

  if (!profile.isActive) {
    return {
      ok: false as const,
      reason: "helper_not_active" as const,
      message: "Helper profile is not active.",
    };
  }

  return {
    ok: true as const,
  };
}

export function activationGateForbiddenResponse(
  gate: ReturnType<typeof evaluateHelperActivationGate>,
  headers: HeadersInit,
) {
  return NextResponse.json(
    {
      message: gate.ok ? "Forbidden" : gate.message,
      reason: gate.ok ? undefined : gate.reason,
    },
    { status: 403, headers },
  );
}
