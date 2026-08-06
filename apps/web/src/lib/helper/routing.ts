import { eq } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";

/**
 * Centralized Helper Routes
 */
export const HELPER_ROUTES = {
  ONBOARDING: "/helper/onboarding",
  VERIFICATION: "/helper/verification",
  DASHBOARD: "/helper",
} as const;

export type HelperRoute = (typeof HELPER_ROUTES)[keyof typeof HELPER_ROUTES];

/**
 * Resolves the initial landing route for a helper based on their profile status.
 */
export async function getHelperLandingPath(userId: string): Promise<HelperRoute> {
  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, userId),
    columns: {
      id: true,
      verificationStatus: true,
      videoKycStatus: true,
      isActive: true,
    },
  });

  // State 1: No profile exists -> Complete onboarding form
  if (!profile) {
    return HELPER_ROUTES.ONBOARDING;
  }

  // State 2: Fully onboarded, verified, and active -> Go to Main Dashboard
  const isFullyVerified =
    profile.isActive &&
    profile.verificationStatus === "approved" &&
    profile.videoKycStatus === "passed";

  if (isFullyVerified) {
    return HELPER_ROUTES.DASHBOARD;
  }

  // State 3: Pending verification / inactive / under review -> Verification status screen
  return HELPER_ROUTES.VERIFICATION;
}