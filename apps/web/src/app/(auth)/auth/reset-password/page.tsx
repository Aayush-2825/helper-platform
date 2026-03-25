import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { getHomeRouteForRole } from "@/lib/auth/roles";
import { ResetPasswordClientPage } from "@/components/auth/reset-password-client-page";

interface ResetPasswordPageProps {
  searchParams?: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect(getHomeRouteForRole((session.user as { role?: string }).role));
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return <ResetPasswordClientPage token={resolvedSearchParams?.token} />;
}

