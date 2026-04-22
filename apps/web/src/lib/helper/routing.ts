import { eq } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";

export async function getHelperLandingPath(userId: string): Promise<string> {
  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, userId),
    columns: {
      id: true,
      verificationStatus: true,
      videoKycStatus: true,
      isActive: true,
    },
  });

  if (!profile) {
    return "/helper/onboarding";
  }

  if (
    profile.verificationStatus === "approved" &&
    profile.videoKycStatus === "passed" &&
    profile.isActive
  ) {
    return "/helper";
  }

  return "/helper/verification";
}
