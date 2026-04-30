"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

type VerificationStatusResponse = {
  profile_status: "pending" | "approved" | "resubmission_required" | "rejected";
  video_kyc_status: "not_required" | "pending_schedule" | "scheduled" | "passed" | "failed";
  is_active: boolean;
  submitted_at: string | null;
  block_resubmission: boolean;
  last_resubmitted_at: string | null;
  resubmission_retry_after: number | null;
  docs: Array<{
    type: string;
    status: string;
    rejection_reason: string | null;
    expires_at: string | null;
  }>;
  video_kyc_session: null | {
    id: string;
    scheduled_at: string;
    attempt_number: number;
    status: "scheduled" | "passed" | "failed" | "no_show" | "cancelled";
  };
};

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatDuration(secondsRemaining: number) {
  const totalMinutes = Math.max(0, Math.floor(secondsRemaining / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function HelperVerificationClientPage() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(Date.now());

  const refreshStatus = async () => {
    try {
      const res = await fetch("/api/helpers/verification-status", { credentials: "include" });
      const json = (await res.json().catch(() => null)) as
        | VerificationStatusResponse
        | { message?: string };

      if (!res.ok) {
        throw new Error((json as { message?: string })?.message ?? "Failed to load verification status.");
      }

      setStatus(json as VerificationStatusResponse);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load verification status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshStatus();

    const pollId = window.setInterval(() => {
      void refreshStatus();
    }, 30_000);

    const tickId = window.setInterval(() => {
      setTick(Date.now());
    }, 1_000);

    const onFocus = () => {
      void refreshStatus();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshStatus();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(pollId);
      window.clearInterval(tickId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!status) return;

    const isFullyActivated =
      status.profile_status === "approved" &&
      status.video_kyc_status === "passed" &&
      status.is_active;

    if (isFullyActivated) {
      router.replace("/helper");
    }
  }, [router, status]);

  const failedDoc = useMemo(() => {
    if (!status) return null;

    return (
      status.docs.find((doc) => doc.status === "rejected" || doc.status === "resubmission_required") ??
      null
    );
  }, [status]);

  const cooldownSeconds = useMemo(() => {
    if (!status?.resubmission_retry_after) return 0;
    return Math.max(0, status.resubmission_retry_after - Math.floor(tick / 1000));
  }, [status, tick]);

  if (loading && !status) {
    return <p className="text-sm text-muted-foreground">Loading verification status...</p>;
  }

  if (error && !status) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load verification</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>{error}</p>
          <Button variant="outline" onClick={() => void refreshStatus()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return (
      <Alert>
        <AlertTitle>Status unavailable</AlertTitle>
        <AlertDescription>Please refresh this page to retry.</AlertDescription>
      </Alert>
    );
  }

  if (status.video_kyc_status === "failed") {
    return (
      <main className="mx-auto grid max-w-3xl gap-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your application was not approved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Your helper application and associated KYC data have been cleared as part of our verification policy.
              Please contact support if you need help.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={async () => {
                  localStorage.removeItem("helper_onboarding_draft");
                  await fetch("/api/helpers/onboarding/draft", { method: "DELETE", credentials: "include" }).catch(
                    () => null,
                  );
                  router.push("/helper/onboarding");
                }}
              >
                Apply as a different helper service
              </Button>
              <Link href="/customer">
                <Button variant="outline">
                  Go to customer portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-3xl gap-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Verification status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Profile review: <span className="font-medium text-foreground">{status.profile_status.replaceAll("_", " ")}</span>
          </p>
          <p>
            Video KYC: <span className="font-medium text-foreground">{status.video_kyc_status.replaceAll("_", " ")}</span>
          </p>
          <p>
            Submitted at: <span className="font-medium text-foreground">{formatDate(status.submitted_at)}</span>
          </p>
        </CardContent>
      </Card>

      {status.profile_status === "pending" ? (
        <Alert>
          <AlertTitle>Documents under review</AlertTitle>
          <AlertDescription>
            Your documents are in review. Estimated review time is 1-2 business days. No action is required right now.
          </AlertDescription>
        </Alert>
      ) : null}

      {status.profile_status === "resubmission_required" ? (
        <Card>
          <CardHeader>
            <CardTitle>Resubmission required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Failed document: <span className="font-medium text-foreground">{failedDoc?.type ?? "Document"}</span>
            </p>
            <p>
              Review note: <span className="font-medium text-foreground">{failedDoc?.rejection_reason ?? "No note provided"}</span>
            </p>
            {status.block_resubmission ? (
              <Alert variant="destructive">
                <AlertTitle>Resubmission blocked</AlertTitle>
                <AlertDescription>Please contact support for next steps.</AlertDescription>
              </Alert>
            ) : cooldownSeconds > 0 ? (
              <Alert>
                <AlertTitle>Cooldown active</AlertTitle>
                <AlertDescription>
                  You can resubmit in {formatDuration(cooldownSeconds)}.
                </AlertDescription>
              </Alert>
            ) : (
              <Link href="/helper/onboarding">
                <Button>
                  Resubmit documents
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : null}

      {status.profile_status === "rejected" ? (
        <Card>
          <CardHeader>
            <CardTitle>Application rejected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{failedDoc?.rejection_reason ?? "Your application was rejected after document review."}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact">
                <Button variant="outline">
                  Contact support
                </Button>
              </Link>
              <Link href="/customer">
                <Button variant="secondary">
                  Go to customer portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {status.profile_status === "approved" && status.video_kyc_status === "pending_schedule" ? (
        <Card>
          <CardHeader>
            <CardTitle>Documents approved. Schedule your video KYC call.</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/helper/video-kyc">
              <Button>
                Open slot picker
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {status.profile_status === "approved" && status.video_kyc_status === "scheduled" ? (
        <Card>
          <CardHeader>
            <CardTitle>Video KYC scheduled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Scheduled at: <span className="font-medium text-foreground">{formatDate(status.video_kyc_session?.scheduled_at ?? null)}</span>
            </p>
            <p>
              Attempt: <span className="font-medium text-foreground">{status.video_kyc_session?.attempt_number ?? 1}</span>
            </p>
            <Link href="/helper/video-kyc">
              <Button>
                Manage booking
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Refresh issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </main>
  );
}
