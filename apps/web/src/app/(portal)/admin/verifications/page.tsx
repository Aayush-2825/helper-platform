"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, Clock3, Loader2, RefreshCcw, Search, ShieldCheck } from "lucide-react";
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

export default function AdminVerificationsPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const response = await fetch("/api/verifications", { credentials: "include" });
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
  }, []);

  const filteredDocuments = useMemo(() => {
    const search = query.trim().toLowerCase();

    return documents.filter((document) => {
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
        </div>
        <Button variant="outline" className="h-11 rounded-2xl font-semibold" onClick={() => void fetchDocuments(true)}>
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
    </div>
  );
}
