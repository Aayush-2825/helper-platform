import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { canRevealJoinLink } from "@/lib/kyc/video-kyc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function HelperVideoKycJoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth/signin?next=%2Fhelper%2Fvideo-kyc%2Fjoin");
  }

  if (session.user.role !== "helper") {
    redirect("/helper");
  }

  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id.trim() : "";
  if (!sessionId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Missing session</AlertTitle>
        <AlertDescription>Open this page using the link from your Video KYC screen.</AlertDescription>
      </Alert>
    );
  }

  const gate = await canRevealJoinLink({ helperUserId: session.user.id, sessionId });

  if (gate.ok) {
    return (
      <main className="grid gap-6">
        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle>Ready to join</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Scheduled at:</span> {formatDate(gate.scheduledAt)}
            </p>
            <ul className="list-disc pl-5">
              <li>Allow camera and microphone permissions.</li>
              <li>Keep documents ready and visible on request.</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/api/helpers/video-kyc/join?session_id=${encodeURIComponent(sessionId)}`}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants()}
              >
                Join call
              </Link>
              <Link href="/helper/video-kyc" className={buttonVariants({ variant: "outline" })}>
                Back
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (gate.reason === "too_early") {
    return (
      <main className="grid gap-6">
        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle>Join window not open yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Scheduled at:</span>{" "}
              {"scheduledAt" in gate ? formatDate(gate.scheduledAt) : "—"}
            </p>
            <p>
              Join becomes available at{" "}
              <span className="font-medium text-foreground">
                {"notBefore" in gate ? formatDate(gate.notBefore) : "—"}
              </span>
              .
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/helper/video-kyc" className={buttonVariants()}>
                Back to Video KYC
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (gate.reason === "expired") {
    return (
      <main className="grid gap-6">
        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle>Join window expired</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This join link is only available near your scheduled time. If you missed the call, schedule a new slot.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/helper/video-kyc" className={buttonVariants()}>
                Back to Video KYC
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>Join not available</AlertTitle>
      <AlertDescription>Please go back to the Video KYC page and check your session status.</AlertDescription>
    </Alert>
  );
}

