import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/db";
import { helperOnboardingDraft } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { getHelperLandingPath } from "@/lib/helper/routing";
import { HelperOnboardingClientPage } from "../helper-onboarding-client";

const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

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

  const draft = await db.query.helperOnboardingDraft.findFirst({
    where: eq(helperOnboardingDraft.userId, session.user.id),
    columns: {
      stepIndex: true,
      payload: true,
      updatedAt: true,
    },
  });

  // eslint-disable-next-line react-hooks/purity -- server-side timestamp comparison is safe here
  if (draft && Date.now() - draft.updatedAt.getTime() > DRAFT_EXPIRY_MS) {
    await db.delete(helperOnboardingDraft).where(eq(helperOnboardingDraft.userId, session.user.id));

    return <HelperOnboardingClientPage initialDraft={null} />;
  }

  return (
    <HelperOnboardingClientPage
      initialDraft={
        draft
          ? {
              step_index: draft.stepIndex,
              payload: {
                ...((draft.payload as Record<string, unknown>) ?? {}),
              },
            }
          : {
              step_index: 0,
              payload: {},
            }
      }
    />
  );
}
