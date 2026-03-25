import { eq } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";

export async function getHelperLandingPath(userId: string): Promise<string> {
  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, userId),
    columns: {
      id: true,
      verificationStatus: true,
    },
  });

  if (!profile) {
    return "/helper/onboarding";
  }

  if (profile.verificationStatus === "approved") {
    return "/helper/dashboard";
  }

  return `/helper/verification-pending?id=${profile.id}`;
}
