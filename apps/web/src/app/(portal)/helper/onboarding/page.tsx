import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { getHelperLandingPath } from "@/lib/helper/routing";
import { HelperOnboardingClientPage } from "../helper-onboarding-client";

/**
 * Helper Onboarding Page
 * Redirects already-onboarded helpers away from onboarding form.
 */
export default async function HelperOnboardingPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin?next=%2Fhelper%2Fonboarding");
  }

  const landingPath = await getHelperLandingPath(session.user.id);
  if (landingPath !== "/helper/onboarding") {
    redirect(landingPath);
  }

  return <HelperOnboardingClientPage />;
}
