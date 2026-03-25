import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { getHomeRouteForRole } from "@/lib/auth/roles";
import { TwoFactorVerifyClientPage } from "@/components/auth/two-factor-verify-client-page";

export default async function TwoFactorVerifyPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect(getHomeRouteForRole((session.user as { role?: string }).role));
  }

  return <TwoFactorVerifyClientPage />;
}

