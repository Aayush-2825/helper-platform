"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Sunrise,
  Sunset,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  XCircle,
  CalendarDays,
} from "lucide-react";

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

type DayGroup = {
  dateKey: string;
  dayLabel: string;
  dateFormatted: string;
  slots: Slot[];
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatTimeOnly(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getPeriod(isoString: string): "morning" | "afternoon" | "evening" {
  const date = new Date(isoString);
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 16) return "afternoon";
  return "evening";
}

export default function HelperVideoKycClient() {
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
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

  // Group slots by day
  const dayGroups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, { dayLabel: string; dateFormatted: string; slots: Slot[] }>();
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    for (const slot of slots) {
      const d = new Date(slot.startsAtIso);
      const dateKey = slot.startsAtIso.slice(0, 10);

      let dayLabel = new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(d);
      if (dateKey === todayStr) {
        dayLabel = "Today";
      } else if (dateKey === tomorrowStr) {
        dayLabel = "Tomorrow";
      }

      const dateFormatted = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d);

      if (!map.has(dateKey)) {
        map.set(dateKey, { dayLabel, dateFormatted, slots: [] });
      }
      map.get(dateKey)!.slots.push(slot);
    }

    return Array.from(map.entries()).map(([dateKey, data]) => ({
      dateKey,
      dayLabel: data.dayLabel,
      dateFormatted: data.dateFormatted,
      slots: data.slots,
    }));
  }, [slots]);

  // Auto-select first date group if none selected
  useEffect(() => {
    if (dayGroups.length > 0 && (!selectedDateKey || !dayGroups.some((g) => g.dateKey === selectedDateKey))) {
      setSelectedDateKey(dayGroups[0].dateKey);
    }
  }, [dayGroups, selectedDateKey]);

  const activeGroup = useMemo(() => {
    return dayGroups.find((g) => g.dateKey === selectedDateKey) ?? dayGroups[0] ?? null;
  }, [dayGroups, selectedDateKey]);

  // Subdivide active group slots by period
  const periodSlots = useMemo(() => {
    if (!activeGroup) return { morning: [], afternoon: [], evening: [] };
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];

    for (const slot of activeGroup.slots) {
      const p = getPeriod(slot.startsAtIso);
      if (p === "morning") morning.push(slot);
      else if (p === "afternoon") afternoon.push(slot);
      else evening.push(slot);
    }

    return { morning, afternoon, evening };
  }, [activeGroup]);

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
    void refreshStatus();
  }, []);

  useEffect(() => {
    if (!status) return;
    if (status.profile_status !== "approved") return;
    if (status.video_kyc_status === "pending_schedule" || status.video_kyc_status === "scheduled") {
      void refreshSlots();
    }
  }, [status]);

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
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading video verification status...</p>
      </div>
    );
  }

  if (statusError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Unable to load status</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 mt-2">
          <p>{statusError}</p>
          <Button variant="outline" size="sm" onClick={() => void refreshStatus()}>
            <RotateCcw className="size-3.5 mr-1.5" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return (
      <Alert>
        <AlertCircle className="size-4" />
        <AlertTitle>Verification status unavailable</AlertTitle>
        <AlertDescription>Unable to load your verification details. Please refresh.</AlertDescription>
      </Alert>
    );
  }

  if (status.profile_status !== "approved") {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <Clock className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Document Verification in Progress</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Video KYC unlocks once your uploaded documents (ID, address proof) are reviewed and approved. Current status:{" "}
              <span className="font-semibold text-foreground uppercase tracking-wider text-xs">
                {status.profile_status.replaceAll("_", " ")}
              </span>
            </p>
          </div>
          <Link href="/helper/verification">
            <Button variant="outline" size="sm">
              View Document Status
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (status.video_kyc_status === "passed") {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-500/10 text-green-600">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Video KYC Verified</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your identity has been verified. You are ready to accept jobs on the DOZO platform!
          </p>
          <div className="pt-2">
            <Link href="/helper">
              <Button className="font-semibold">Go to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status.video_kyc_status === "failed") {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Verification Unsuccessful</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your video verification could not be completed. Please contact our support team to re-initiate verification.
          </p>
          <div className="pt-2">
            <Link href="/support">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Active Scheduled Card */}
      {scheduledSession ? (
        <Card className="border-primary/40 bg-primary/5 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Appointment Confirmed</span>
              </div>
              <span className="text-xs text-muted-foreground bg-background px-2.5 py-1 rounded-md border">
                Attempt #{scheduledSession.attempt_number} of 3
              </span>
            </div>
            <CardTitle className="text-xl font-black mt-2">
              {formatDateTime(scheduledSession.scheduled_at)}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Video className="size-3.5 text-primary" />
              15-20 min verification call via Google Meet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div className="rounded-xl border bg-card/60 p-3.5 space-y-2 text-xs">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Preparation instructions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Keep your original government ID card in hand (Aadhar / PAN).</li>
                <li>Sit in a well-lit room with no background noise.</li>
                <li>The meeting join link will be activated 5 minutes before the call.</li>
              </ul>
            </div>

            {canManageScheduled ? (
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  href={`/helper/video-kyc/join?session_id=${encodeURIComponent(scheduledSession.id)}`}
                  className="flex-1 min-w-36"
                >
                  <Button className="w-full font-bold shadow-sm">
                    <Video className="size-4 mr-2" />
                    Enter Meeting Room
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => void cancelSession()}
                  disabled={actionLoading}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80"
                >
                  Cancel Call
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">This session is no longer active.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Slot Picker Component */}
      {(canPickSlot || canManageScheduled) && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <CalendarDays className="size-5 text-primary" />
                  {scheduledSession ? "Reschedule Appointment" : "Select Your Verification Slot"}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Choose a date and convenient time for your 1-on-1 video call.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void refreshSlots()}
                disabled={loadingSlots}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className={`size-3.5 mr-1.5 ${loadingSlots ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {slotsError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Unable to load slots</AlertTitle>
                <AlertDescription className="text-xs mt-1">{slotsError}</AlertDescription>
              </Alert>
            ) : null}

            {/* 1. Date Selector Tabs */}
            {dayGroups.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Choose Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {dayGroups.map((group) => {
                    const isSelected = selectedDateKey === group.dateKey;
                    return (
                      <button
                        key={group.dateKey}
                        type="button"
                        onClick={() => {
                          setSelectedDateKey(group.dateKey);
                          setSelectedSlotIso(null);
                        }}
                        className={`flex flex-col items-center justify-center min-w-24 px-3.5 py-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-102"
                            : "border-border/70 bg-card hover:bg-accent text-foreground"
                        }`}
                      >
                        <span className={`text-[11px] font-bold uppercase ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                          {group.dayLabel}
                        </span>
                        <span className="text-sm font-black mt-0.5 tracking-tight">
                          {group.dateFormatted}
                        </span>
                        <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {group.slots.length} slots
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Time Slots Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Choose Time Slot
                </label>
                {activeGroup && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {activeGroup.dayLabel}, {activeGroup.dateFormatted}
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 py-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-muted/60 animate-pulse" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-xl bg-muted/20">
                  <Clock className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">No slots available currently</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    New slots open every morning. Please check back shortly or click refresh.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  {periodSlots.morning.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Sunrise className="size-3.5 text-amber-500" />
                        <span>Morning</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {periodSlots.morning.map((slot) => {
                          const isSelected = selectedSlotIso === slot.startsAtIso;
                          return (
                            <button
                              key={slot.startsAtIso}
                              type="button"
                              onClick={() => setSelectedSlotIso(slot.startsAtIso)}
                              className={`flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl border text-sm font-semibold transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-1"
                                  : "border-border/70 bg-card hover:bg-accent text-foreground hover:border-primary/40"
                              }`}
                            >
                              <Clock className={`size-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <span>{formatTimeOnly(slot.startsAtIso)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {periodSlots.afternoon.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Sun className="size-3.5 text-amber-500" />
                        <span>Afternoon</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {periodSlots.afternoon.map((slot) => {
                          const isSelected = selectedSlotIso === slot.startsAtIso;
                          return (
                            <button
                              key={slot.startsAtIso}
                              type="button"
                              onClick={() => setSelectedSlotIso(slot.startsAtIso)}
                              className={`flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl border text-sm font-semibold transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-1"
                                  : "border-border/70 bg-card hover:bg-accent text-foreground hover:border-primary/40"
                              }`}
                            >
                              <Clock className={`size-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <span>{formatTimeOnly(slot.startsAtIso)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Evening Slots */}
                  {periodSlots.evening.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Sunset className="size-3.5 text-orange-500" />
                        <span>Evening</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {periodSlots.evening.map((slot) => {
                          const isSelected = selectedSlotIso === slot.startsAtIso;
                          return (
                            <button
                              key={slot.startsAtIso}
                              type="button"
                              onClick={() => setSelectedSlotIso(slot.startsAtIso)}
                              className={`flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl border text-sm font-semibold transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-1"
                                  : "border-border/70 bg-card hover:bg-accent text-foreground hover:border-primary/40"
                              }`}
                            >
                              <Clock className={`size-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <span>{formatTimeOnly(slot.startsAtIso)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {actionError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Action failed</AlertTitle>
                <AlertDescription className="text-xs mt-1">{actionError}</AlertDescription>
              </Alert>
            ) : null}

            {/* 3. Selected Slot Confirmation Card */}
            {selectedSlotIso && (
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Selected Slot
                    </p>
                    <p className="text-base font-black text-foreground mt-0.5">
                      {formatDateTime(selectedSlotIso)}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                    <CheckCircle2 className="size-3.5" />
                    20 Mins
                  </span>
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Video className="size-3.5 text-primary" />
                  Google Meet link will be generated automatically upon confirmation.
                </div>

                <div className="pt-1">
                  {scheduledSession ? (
                    <Button
                      onClick={() => void rescheduleSelectedSlot()}
                      disabled={actionLoading}
                      className="w-full font-bold h-11 rounded-xl shadow-sm text-sm"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Rescheduling Appointment...
                        </>
                      ) : (
                        <>
                          Confirm Reschedule
                          <ArrowRight className="size-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => void bookSelectedSlot()}
                      disabled={actionLoading}
                      className="w-full font-bold h-11 rounded-xl shadow-sm text-sm"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Booking Appointment...
                        </>
                      ) : (
                        <>
                          Confirm & Book Appointment
                          <ArrowRight className="size-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
