import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HelperVideoKycClient from "./video-kyc-client";

export default async function HelperVideoKycPage() {
  await connection();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth/signin?next=%2Fhelper%2Fvideo-kyc");
  }

  if (session.user.role !== "helper") {
    redirect("/helper");
  }

  return (
    <main className="grid gap-6">
      <Card className="surface-card border-none">
        <CardHeader>
          <CardTitle>Video KYC</CardTitle>
          <CardDescription>
            Pick a slot, confirm your details, and join the call in the allowed time window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HelperVideoKycClient />
        </CardContent>
      </Card>
    </main>
  );
}

