"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type VerificationStatusResponse = {
  profile_status: "pending" | "approved" | "resubmission_required" | "rejected";
  video_kyc_status: "not_required" | "pending_schedule" | "scheduled" | "passed" | "failed";
  video_kyc_session: null | {
    id: string;
    scheduled_at: string;
    attempt_number: number;
    status: "scheduled" | "passed" | "failed" | "no_show" | "cancelled";
  };
};

type Slot = {
  startsAtIso: string;
  endsAtIso: string;
  label: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function HelperVideoKycClient() {
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const scheduledSession = status?.video_kyc_session ?? null;

  const canPickSlot = useMemo(() => {
    if (!status) return false;
    if (status.profile_status !== "approved") return false;
    return status.video_kyc_status === "pending_schedule";
  }, [status]);

  const canManageScheduled = useMemo(() => {
    if (!status || !scheduledSession) return false;
    return status.video_kyc_status === "scheduled" && scheduledSession.status === "scheduled";
  }, [status, scheduledSession]);

  async function refreshStatus() {
    setLoadingStatus(true);
    setStatusError(null);
    try {
      const res = await fetch("/api/helpers/verification-status", { credentials: "include" });
      const json = (await res.json()) as VerificationStatusResponse | { message?: string };
      if (!res.ok) {
        throw new Error("message" in json && json.message ? json.message : "Failed to load verification status.");
      }
      setStatus(json as VerificationStatusResponse);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to load verification status.");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function refreshSlots() {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const res = await fetch("/api/helpers/video-kyc/slots", { credentials: "include" });
      const json = (await res.json()) as { slots?: Slot[]; message?: string };
      if (!res.ok) {
        throw new Error(json.message ?? "Failed to load slots.");
      }
      setSlots(Array.isArray(json.slots) ? json.slots : []);
    } catch (error) {
      setSlotsError(error instanceof Error ? error.message : "Failed to load slots.");
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    if (!status) return;
    if (status.profile_status !== "approved") return;
    if (status.video_kyc_status === "pending_schedule" || status.video_kyc_status === "scheduled") {
      refreshSlots();
    }
  }, [status?.profile_status, status?.video_kyc_status]);

  async function bookSelectedSlot() {
    if (!selectedSlotIso) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/helpers/video-kyc/book", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_at: selectedSlotIso }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        throw new Error(json.message ?? "Unable to book slot.");
      }
      await refreshStatus();
      setSelectedSlotIso(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to book slot.");
    } finally {
      setActionLoading(false);
    }
  }

  async function rescheduleSelectedSlot() {
    if (!selectedSlotIso || !scheduledSession) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/helpers/video-kyc/reschedule", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: scheduledSession.id, scheduled_at: selectedSlotIso }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        throw new Error(json.message ?? "Unable to reschedule.");
      }
      await refreshStatus();
      setSelectedSlotIso(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to reschedule.");
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelSession() {
    if (!scheduledSession) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/helpers/video-kyc/cancel", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: scheduledSession.id }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        throw new Error(json.message ?? "Unable to cancel.");
      }
      await refreshStatus();
      setSelectedSlotIso(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to cancel.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loadingStatus && !status) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (statusError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>{statusError}</p>
          <Button variant="outline" onClick={() => refreshStatus()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return (
      <Alert>
        <AlertTitle>Not ready</AlertTitle>
        <AlertDescription>Unable to load your verification status. Please retry.</AlertDescription>
      </Alert>
    );
  }

  if (status.profile_status !== "approved") {
    return (
      <Alert>
        <AlertTitle>Documents not approved yet</AlertTitle>
        <AlertDescription>
          Video KYC opens after your documents are approved. Current status:{" "}
          <span className="font-medium">{status.profile_status.replaceAll("_", " ")}</span>.
        </AlertDescription>
      </Alert>
    );
  }

  if (status.video_kyc_status === "passed") {
    return (
      <Alert>
        <AlertTitle>Video KYC completed</AlertTitle>
        <AlertDescription>Your video KYC is marked as passed.</AlertDescription>
      </Alert>
    );
  }

  if (status.video_kyc_status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Video KYC failed</AlertTitle>
        <AlertDescription>Please contact support for next steps.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Before you book</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc pl-5">
            <li>Keep your ID and documents ready (same as onboarding uploads).</li>
            <li>Join from a quiet place with good lighting.</li>
            <li>Use a stable internet connection.</li>
          </ul>
          <p>
            Join is available only near your scheduled time (for security). You can reschedule up to the attempt limit.
          </p>
        </CardContent>
      </Card>

      {scheduledSession ? (
        <Alert>
          <AlertTitle>Scheduled</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              <span className="font-medium">Scheduled at:</span> {formatDate(scheduledSession.scheduled_at)}
            </p>
            <p>
              <span className="font-medium">Attempt:</span> {scheduledSession.attempt_number}
            </p>
            {canManageScheduled ? (
              <div className="flex flex-wrap gap-2">
                <Link href={`/helper/video-kyc/join?session_id=${encodeURIComponent(scheduledSession.id)}`}>
                  <Button>Open join screen</Button>
                </Link>
                <Button variant="outline" onClick={() => refreshSlots()} disabled={loadingSlots}>
                  Refresh slots
                </Button>
                <Button variant="destructive" onClick={() => cancelSession()} disabled={actionLoading}>
                  Cancel
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">This session is no longer active.</p>
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      {(canPickSlot || canManageScheduled) ? (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">{scheduledSession ? "Reschedule" : "Pick a slot"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {slotsError ? (
              <Alert variant="destructive">
                <AlertTitle>Unable to load slots</AlertTitle>
                <AlertDescription>{slotsError}</AlertDescription>
              </Alert>
            ) : null}

            <ScrollArea className="h-64 rounded-md border border-border/60">
              <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading slots…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No slots available right now. Try again later.</p>
                ) : (
                  slots.map((slot) => {
                    const selected = selectedSlotIso === slot.startsAtIso;
                    return (
                      <button
                        key={slot.startsAtIso}
                        type="button"
                        onClick={() => setSelectedSlotIso(slot.startsAtIso)}
                        className={[
                          "rounded-md border px-3 py-2 text-left text-sm",
                          selected ? "border-primary bg-primary/10" : "border-border/60 hover:bg-accent",
                        ].join(" ")}
                      >
                        <div className="font-medium">{slot.label}</div>
                        <div className="text-xs text-muted-foreground">Duration: 20 min</div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {actionError ? (
              <Alert variant="destructive">
                <AlertTitle>Action failed</AlertTitle>
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {scheduledSession ? (
                <Button
                  onClick={() => rescheduleSelectedSlot()}
                  disabled={!selectedSlotIso || actionLoading}
                >
                  Reschedule
                </Button>
              ) : (
                <Button onClick={() => bookSelectedSlot()} disabled={!selectedSlotIso || actionLoading}>
                  Confirm slot
                </Button>
              )}
              <Button variant="outline" onClick={() => refreshStatus()} disabled={loadingStatus}>
                Refresh status
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>Scheduling not available</AlertTitle>
          <AlertDescription>
            Current video KYC status: <span className="font-medium">{status.video_kyc_status.replaceAll("_", " ")}</span>.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

