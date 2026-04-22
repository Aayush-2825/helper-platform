"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, CheckCircle2, Clock3, Loader2, RefreshCcw, Search, ShieldCheck, Video, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type VerificationDocument = {
  id: string;
  helperProfileId: string;
  documentType: string;
  documentNumber?: string | null;
  fileUrl: string;
  status: "pending" | "approved" | "rejected" | "resubmission_required";
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  helperProfile?: {
    id: string;
    userId: string;
    primaryCategory: string;
    serviceCity?: string | null;
    verificationStatus: string;
    availabilityStatus: string;
    isActive: boolean;
    submittedAt?: string | null;
    hoursInQueue?: number | null;
    updatedAt: string;
    user?: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
    };
  };
  reviewedByUser?: {
    id: string;
    name: string;
    email: string;
  };
};

type VerificationStatus = VerificationDocument["status"];

type PendingVideoKycHelper = {
  id: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
};

type VideoKycSession = {
  id: string;
  meetLink: string;
  scheduledAt: string;
  attemptNumber: number;
  status: "scheduled" | "passed" | "failed" | "no_show" | "cancelled";
  helperProfile?: {
    id: string;
    userId: string;
    user?: {
      name: string;
      email: string;
    };
  };
};

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminVerificationsPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [videoSessions, setVideoSessions] = useState<VideoKycSession[]>([]);
  const [pendingVideoHelpers, setPendingVideoHelpers] = useState<PendingVideoKycHelper[]>([]);
  const [pendingVideoSchedule, setPendingVideoSchedule] = useState<Record<string, string>>({});
  const [rescheduleVideoSchedule, setRescheduleVideoSchedule] = useState<Record<string, string>>({});
  const [videoAdminNotes, setVideoAdminNotes] = useState<Record<string, string>>({});
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"documents" | "video-kyc">("documents");
  const [includeHistory, setIncludeHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingVideoId, setUpdatingVideoId] = useState<string | null>(null);
  const [schedulingHelperId, setSchedulingHelperId] = useState<string | null>(null);
  const [reschedulingVideoId, setReschedulingVideoId] = useState<string | null>(null);
  const [cancellingVideoId, setCancellingVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    status: "approved" as VerificationStatus,
    rejectionReason: "",
  });

  const fetchDocuments = async (isManualRefresh = false) => {
    setError(null);
    setSuccess(null);
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/verifications?include_history=${includeHistory}`, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Could not load verification queue.");
      }

      const data = (await response.json()) as { documents?: VerificationDocument[] };
      const nextDocuments = data.documents ?? [];
      setDocuments(nextDocuments);
      setSelectedDocumentId((current) => current ?? nextDocuments[0]?.id ?? null);
    } catch (fetchError) {
      setDocuments([]);
      setSelectedDocumentId(null);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load verification queue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchDocuments();
  }, [includeHistory]);

  const fetchVideoSessions = async () => {
    setVideoLoading(true);
    try {
      const response = await fetch("/api/verifications/video-kyc", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Could not load video KYC sessions.");
      }

      const data = (await response.json()) as {
        sessions?: VideoKycSession[];
        pendingHelpers?: PendingVideoKycHelper[];
      };
      setVideoSessions(data.sessions ?? []);
      setPendingVideoHelpers(data.pendingHelpers ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load video KYC sessions.");
    } finally {
      setVideoLoading(false);
    }
  };

  useEffect(() => {
    void fetchVideoSessions();
  }, []);

  const filteredDocuments = useMemo(() => {
    const search = query.trim().toLowerCase();

    return documents
      .filter((document) => {
      if (statusFilter !== "all" && document.status !== statusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        document.id,
        document.helperProfileId,
        document.documentType,
        document.documentNumber ?? "",
        document.status,
        document.helperProfile?.user?.name ?? "",
        document.helperProfile?.user?.email ?? "",
        document.helperProfile?.serviceCity ?? "",
        document.helperProfile?.primaryCategory ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
        })
        .sort((a, b) => {
          const hoursA = a.helperProfile?.hoursInQueue ?? -1;
          const hoursB = b.helperProfile?.hoursInQueue ?? -1;
          if (hoursB !== hoursA) {
            return hoursB - hoursA;
          }

          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
  }, [documents, query, statusFilter]);

  const selectedDocument = useMemo(
    () => filteredDocuments.find((document) => document.id === selectedDocumentId) ?? filteredDocuments[0] ?? null,
    [filteredDocuments, selectedDocumentId],
  );

  useEffect(() => {
    if (!selectedDocument) {
      return;
    }

    setFormState({
      status: selectedDocument.status === "pending" ? "approved" : selectedDocument.status,
      rejectionReason: selectedDocument.rejectionReason ?? "",
    });
  }, [selectedDocument]);

  const statusStyles: Record<VerificationStatus, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    approved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
    resubmission_required: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  };

  const getQueueSlaClass = (hoursInQueue?: number | null) => {
    if (typeof hoursInQueue !== "number") {
      return "text-muted-foreground";
    }

    if (hoursInQueue > 72) {
      return "text-rose-600 dark:text-rose-300";
    }

    if (hoursInQueue > 48) {
      return "text-amber-600 dark:text-amber-300";
    }

    return "text-muted-foreground";
  };

  const updateDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documentId: selectedDocument.id,
          status: formState.status,
          rejectionReason: formState.rejectionReason.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not update the verification document.");
      }

      setSuccess("Verification updated successfully.");
      await fetchDocuments(true);
      setSelectedDocumentId(selectedDocument.id);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update verification.");
    } finally {
      setSaving(false);
    }
  };

  const updateVideoSession = async (
    sessionId: string,
    outcome: "passed" | "failed" | "no_show",
  ) => {
    setUpdatingVideoId(sessionId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/verifications/video-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          session_id: sessionId,
          outcome,
          admin_notes: videoAdminNotes[sessionId]?.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not update video KYC outcome.");
      }

      setSuccess("Video KYC session updated.");
      await fetchVideoSessions();
      await fetchDocuments(true);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update video KYC.");
    } finally {
      setUpdatingVideoId(null);
    }
  };

  const scheduleVideoKyc = async (helperProfileId: string) => {
    setSchedulingHelperId(helperProfileId);
    setError(null);
    setSuccess(null);

    try {
      const selected = pendingVideoSchedule[helperProfileId];
      if (!selected) {
        throw new Error("Pick a date/time before scheduling.");
      }

      const scheduledDate = new Date(selected);
      if (Number.isNaN(scheduledDate.getTime())) {
        throw new Error("Invalid date/time selected.");
      }

      const scheduledAtIso = scheduledDate.toISOString();
      const response = await fetch("/api/verifications/video-kyc/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ helper_profile_id: helperProfileId, scheduled_at: scheduledAtIso }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not schedule video KYC.");
      }

      setSuccess("Video KYC scheduled.");
      await fetchVideoSessions();
      await fetchDocuments(true);
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : "Unable to schedule video KYC.");
    } finally {
      setSchedulingHelperId(null);
    }
  };

  const rescheduleVideoKyc = async (sessionId: string) => {
    setReschedulingVideoId(sessionId);
    setError(null);
    setSuccess(null);

    try {
      const selected = rescheduleVideoSchedule[sessionId];
      if (!selected) {
        throw new Error("Pick a date/time before rescheduling.");
      }

      const scheduledDate = new Date(selected);
      if (Number.isNaN(scheduledDate.getTime())) {
        throw new Error("Invalid date/time selected.");
      }

      const response = await fetch("/api/verifications/video-kyc/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          session_id: sessionId,
          scheduled_at: scheduledDate.toISOString(),
          admin_notes: videoAdminNotes[sessionId]?.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not reschedule video KYC.");
      }

      setSuccess("Video KYC rescheduled.");
      await fetchVideoSessions();
    } catch (rescheduleError) {
      setError(rescheduleError instanceof Error ? rescheduleError.message : "Unable to reschedule video KYC.");
    } finally {
      setReschedulingVideoId(null);
    }
  };

  const cancelVideoKyc = async (sessionId: string) => {
    setCancellingVideoId(sessionId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/verifications/video-kyc/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          session_id: sessionId,
          admin_notes: videoAdminNotes[sessionId]?.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not cancel video KYC.");
      }

      setSuccess("Video KYC cancelled.");
      await fetchVideoSessions();
      await fetchDocuments(true);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Unable to cancel video KYC.");
    } finally {
      setCancellingVideoId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      pending: documents.filter((document) => document.status === "pending").length,
      approved: documents.filter((document) => document.status === "approved").length,
      rejected: documents.filter((document) => document.status === "rejected").length,
      resubmission: documents.filter((document) => document.status === "resubmission_required").length,
    };
  }, [documents]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">Verification Queue</h1>
          <p className="text-sm text-muted-foreground">Review KYC documents, approve helpers, and request resubmissions when needed.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant={activeTab === "documents" ? "default" : "outline"}
              className="h-9 rounded-xl"
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </Button>
            <Button
              variant={activeTab === "video-kyc" ? "default" : "outline"}
              className="h-9 rounded-xl"
              onClick={() => setActiveTab("video-kyc")}
            >
              <Video className="mr-2 size-4" />
              Video KYC
            </Button>
            {activeTab === "documents" ? (
              <Button
                variant={includeHistory ? "default" : "outline"}
                className="h-9 rounded-xl"
                onClick={() => setIncludeHistory((current) => !current)}
              >
                {includeHistory ? "Showing full history" : "Show full history"}
              </Button>
            ) : null}
          </div>
        </div>
        <Button
          variant="outline"
          className="h-11 rounded-2xl font-semibold"
          onClick={() =>
            void (activeTab === "documents" ? fetchDocuments(true) : fetchVideoSessions())
          }
        >
          {refreshing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-700 dark:text-green-300">
          <BadgeCheck className="size-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.pending}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.approved}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Resubmissions</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.resubmission}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {activeTab === "documents" ? (
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search document, helper, city, or category..."
                  className="h-12 pl-11"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as VerificationStatus | "all")}
                className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resubmission_required">Resubmission required</option>
              </select>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted/60" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                No verification documents match the current filters.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredDocuments.map((document) => {
                  const isSelected = selectedDocument?.id === document.id;

                  return (
                    <button
                      key={document.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(document.id)}
                      className={cn(
                        "rounded-3xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                        isSelected
                          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/60 bg-card/40",
                      )}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={cn("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", statusStyles[document.status])}>
                              {document.status.replaceAll("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{document.documentType}</span>
                          </div>
                          <p className="font-semibold">{document.helperProfile?.user?.name ?? document.helperProfileId}</p>
                          <p className="max-w-3xl text-sm text-muted-foreground line-clamp-2">{document.helperProfile?.serviceCity ?? "Unknown city"} • {document.helperProfile?.primaryCategory ?? "Unknown category"}</p>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground md:text-right">
                          <p>{document.helperProfile?.user?.email ?? "No email"}</p>
                          <p>Added {formatDate(document.createdAt)}</p>
                          <p>{document.documentNumber ?? "No document number"}</p>
                          <p className={cn("font-semibold", getQueueSlaClass(document.helperProfile?.hoursInQueue))}>
                            Queue: {typeof document.helperProfile?.hoursInQueue === "number" ? `${document.helperProfile.hoursInQueue.toFixed(1)}h` : "—"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-5 p-5 sm:p-6">
            {selectedDocument ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    <h2 className="text-xl font-heading font-bold">Document {selectedDocument.id.slice(0, 8)}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedDocument.helperProfile?.user?.name ?? "Unknown helper"} • {selectedDocument.helperProfile?.serviceCity ?? "Unknown city"}</p>
                </div>

                <div className="grid gap-3 rounded-3xl border border-border/60 bg-muted/20 p-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selectedDocument.documentType}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Number:</span> {selectedDocument.documentNumber ?? "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current status:</span> {selectedDocument.status.replaceAll("_", " ")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hours in queue:</span>{" "}
                    <span className={cn("font-semibold", getQueueSlaClass(selectedDocument.helperProfile?.hoursInQueue))}>
                      {typeof selectedDocument.helperProfile?.hoursInQueue === "number"
                        ? `${selectedDocument.helperProfile.hoursInQueue.toFixed(1)}h`
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File:</span>{" "}
                    <a href={selectedDocument.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                      View document
                    </a>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-border/60 bg-card/30 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium">
                      <span>Decision</span>
                      <select
                        value={formState.status}
                        onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as VerificationStatus }))}
                        className="h-12 w-full rounded-2xl border border-border/50 bg-background px-4 outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      >
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="resubmission_required">Resubmission required</option>
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium">
                      <span>Decision time</span>
                      <div className="flex h-12 items-center rounded-2xl border border-border/50 bg-background px-4 text-sm text-muted-foreground">
                        <Clock3 className="mr-2 size-4" />
                        {selectedDocument.reviewedAt ? formatDate(selectedDocument.reviewedAt) : "Pending review"}
                      </div>
                    </label>
                  </div>

                  <label className="space-y-2 text-sm font-medium">
                    <span>Rejection reason or reviewer notes</span>
                    <Textarea
                      value={formState.rejectionReason}
                      onChange={(event) => setFormState((current) => ({ ...current, rejectionReason: event.target.value }))}
                      placeholder="Explain why the document needs resubmission or rejection."
                      className="min-h-28 rounded-2xl"
                    />
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {selectedDocument.reviewedByUser ? `Reviewed by ${selectedDocument.reviewedByUser.name}` : "Waiting for review"}
                    </div>
                    <Button className="rounded-2xl font-semibold" onClick={() => void updateDocument()} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Save decision
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Operational note</p>
                  <p className="mt-1">This queue now works against the live verification API. Bulk actions and side-by-side compare can be layered on next if needed.</p>
                </div>
              </>
            ) : (
              <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
                Select a verification document to review its details and approve or reject it.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      ) : (
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <h2 className="text-xl font-heading font-bold">Scheduled Video KYC Calls</h2>
            {!videoLoading && pendingVideoHelpers.length > 0 ? (
              <div className="space-y-3 rounded-3xl border border-border/60 bg-card/40 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">Needs scheduling</p>
                    <p className="text-sm text-muted-foreground">Helpers approved for documents but missing a scheduled video call.</p>
                  </div>
                  <Badge variant="secondary" className="w-fit">{pendingVideoHelpers.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {pendingVideoHelpers.map((helper) => (
                    <div key={helper.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">{helper.user?.name ?? helper.id}</p>
                          <p className="text-sm text-muted-foreground">{helper.user?.email ?? "No email"}</p>
                          <p className="text-xs text-muted-foreground">Last updated {formatDate(helper.updatedAt)}</p>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                          <Input
                            type="datetime-local"
                            value={pendingVideoSchedule[helper.id] ?? ""}
                            onChange={(event) =>
                              setPendingVideoSchedule((current) => ({ ...current, [helper.id]: event.target.value }))
                            }
                            className="h-10 rounded-xl sm:w-56"
                          />
                          <Button
                            className="rounded-xl font-semibold"
                            onClick={() => void scheduleVideoKyc(helper.id)}
                            disabled={schedulingHelperId === helper.id || !pendingVideoSchedule[helper.id]}
                          >
                            {schedulingHelperId === helper.id ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Clock3 className="mr-2 size-4" />}
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {videoLoading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
                ))}
              </div>
            ) : videoSessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                No scheduled video KYC sessions.
              </div>
            ) : (
              <div className="grid gap-3">
                {videoSessions.map((session) => (
                  <div key={session.id} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{session.helperProfile?.user?.name ?? session.helperProfile?.id}</p>
                        <p className="text-sm text-muted-foreground">{session.helperProfile?.user?.email ?? "No email"}</p>
                        <p className="text-sm text-muted-foreground">Scheduled {formatDate(session.scheduledAt)} • Attempt {session.attemptNumber}</p>
                        <a href={session.meetLink} target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-4 hover:underline">
                          Open Meet link
                        </a>
                      </div>
                      <div className="flex w-full flex-col gap-2 lg:w-auto lg:items-end">
                        <div className="flex w-full flex-col gap-2 sm:flex-row lg:justify-end">
                          <Input
                            type="datetime-local"
                            value={rescheduleVideoSchedule[session.id] ?? toDateTimeLocalValue(session.scheduledAt)}
                            onChange={(event) =>
                              setRescheduleVideoSchedule((current) => ({ ...current, [session.id]: event.target.value }))
                            }
                            className="h-10 rounded-xl sm:w-56"
                          />
                          <Input
                            value={videoAdminNotes[session.id] ?? ""}
                            onChange={(event) =>
                              setVideoAdminNotes((current) => ({ ...current, [session.id]: event.target.value }))
                            }
                            placeholder="Notes (optional)"
                            className="h-10 rounded-xl sm:w-56"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => void rescheduleVideoKyc(session.id)}
                            disabled={reschedulingVideoId === session.id}
                          >
                            {reschedulingVideoId === session.id ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Clock3 className="mr-2 size-4" />}
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => void cancelVideoKyc(session.id)}
                            disabled={cancellingVideoId === session.id}
                          >
                            {cancellingVideoId === session.id ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Cancel
                          </Button>
                          <Button
                            className="rounded-xl"
                            onClick={() => void updateVideoSession(session.id, "passed")}
                            disabled={updatingVideoId === session.id}
                          >
                            <CheckCircle2 className="mr-2 size-4" />
                            Pass
                          </Button>
                          <Button
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => void updateVideoSession(session.id, "failed")}
                            disabled={updatingVideoId === session.id}
                          >
                            <XCircle className="mr-2 size-4" />
                            Fail
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => void updateVideoSession(session.id, "no_show")}
                            disabled={updatingVideoId === session.id}
                          >
                            No-show
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
