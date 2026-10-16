import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { getHomeRouteForRole } from "@/lib/auth/roles";
import { SignInClientPage } from "@features/auth/components/signin-client-page";
import { authMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...authMetadata,
  title: "Sign In — DOZO",
};

interface SignInPageProps {
  searchParams?: Promise<{
    next?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath = resolvedSearchParams?.next;
  const safeNextPath = nextPath && nextPath.startsWith("/") ? nextPath : undefined;

  if (session?.user) {
    if (safeNextPath) {
      redirect(safeNextPath);
    }

    redirect(getHomeRouteForRole((session.user as { role?: string }).role));
  }

  return <SignInClientPage nextPath={safeNextPath} />;
}

