import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { getHomeRouteForRole } from "@/lib/auth/roles";
import { VerifyEmailClientPage } from "@/components/auth/verify-email-client-page";

export default async function VerifyEmailPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect(getHomeRouteForRole((session.user as { role?: string }).role));
  }

  return <VerifyEmailClientPage />;
}
