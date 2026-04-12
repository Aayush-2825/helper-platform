"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CircleAlert, CircleCheckBig, Loader2, MessageSquare, RefreshCcw, Scale, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DisputeRecord = {
  id: string;
  bookingId: string;
  raisedByUserId: string;
  againstUserId?: string | null;
  status: "open" | "investigating" | "resolved" | "rejected";
  reasonCode: string;
  description: string;
  adminNotes?: string | null;
  resolutionType?: "refund_full" | "refund_partial" | "no_refund" | "credit_note" | "other" | null;
  resolutionAmount?: number | null;
  resolvedByUserId?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    status: string;
    addressLine?: string | null;
    city?: string | null;
    categoryId?: string | null;
  };
  raisedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  againstUser?: {
    id: string;
    name: string;
    email: string;
  };
};

type DisputeStatus = DisputeRecord["status"];

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

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    status: "investigating" as DisputeStatus,
    resolutionType: "other" as NonNullable<DisputeRecord["resolutionType"]>,
    resolutionAmount: "",
    adminNotes: "",
  });

  const fetchDisputes = async (isManualRefresh = false) => {
    setError(null);
    setSuccess(null);
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/disputes", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Could not load disputes.");
      }

      const data = (await response.json()) as { disputes?: DisputeRecord[] };
      const nextDisputes = data.disputes ?? [];
      setDisputes(nextDisputes);
      setSelectedDisputeId((current) => current ?? nextDisputes[0]?.id ?? null);
    } catch (fetchError) {
      setDisputes([]);
      setSelectedDisputeId(null);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load disputes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchDisputes();
  }, []);

  const filteredDisputes = useMemo(() => {
    const search = query.trim().toLowerCase();

    return disputes.filter((dispute) => {
      if (statusFilter !== "all" && dispute.status !== statusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        dispute.id,
        dispute.bookingId,
        dispute.reasonCode,
        dispute.description,
        dispute.status,
        dispute.raisedByUser?.name ?? "",
        dispute.raisedByUser?.email ?? "",
        dispute.againstUser?.name ?? "",
        dispute.againstUser?.email ?? "",
        dispute.booking?.addressLine ?? "",
        dispute.booking?.city ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [disputes, query, statusFilter]);

  const selectedDispute = useMemo(
    () => filteredDisputes.find((dispute) => dispute.id === selectedDisputeId) ?? filteredDisputes[0] ?? null,
    [filteredDisputes, selectedDisputeId],
  );

  useEffect(() => {
    if (!selectedDispute) {
      return;
    }

    setFormState({
      status: selectedDispute.status === "open" ? "investigating" : selectedDispute.status,
      resolutionType: selectedDispute.resolutionType ?? "other",
      resolutionAmount: selectedDispute.resolutionAmount?.toString() ?? "",
      adminNotes: selectedDispute.adminNotes ?? "",
    });
  }, [selectedDispute]);

  const statusStyles: Record<DisputeStatus, string> = {
    open: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    investigating: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    resolved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
  };

  const updateDispute = async () => {
    if (!selectedDispute) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          disputeId: selectedDispute.id,
          status: formState.status,
          resolutionType: formState.resolutionType,
          resolutionAmount: formState.resolutionAmount.trim() ? Number(formState.resolutionAmount) : undefined,
          adminNotes: formState.adminNotes.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not update the dispute.");
      }

      setSuccess("Dispute updated successfully.");
      await fetchDisputes(true);
      setSelectedDisputeId(selectedDispute.id);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update dispute.");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    return {
      open: disputes.filter((dispute) => dispute.status === "open").length,
      investigating: disputes.filter((dispute) => dispute.status === "investigating").length,
      resolved: disputes.filter((dispute) => dispute.status === "resolved").length,
      rejected: disputes.filter((dispute) => dispute.status === "rejected").length,
    };
  }, [disputes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">Dispute Resolution</h1>
          <p className="text-sm text-muted-foreground">Triage escalations, document decisions, and resolve service conflicts.</p>
        </div>
        <Button variant="outline" className="h-11 rounded-2xl font-semibold" onClick={() => void fetchDisputes(true)}>
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
          <CircleCheckBig className="size-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.open}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Investigating</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.investigating}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.resolved}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold">{loading ? "—" : summary.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search disputes, bookings, users, or reason codes..."
                  className="h-12 pl-11"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as DisputeStatus | "all")}
                className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted/60" />
                ))}
              </div>
            ) : filteredDisputes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                No disputes match the current filters.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredDisputes.map((dispute) => {
                  const isSelected = selectedDispute?.id === dispute.id;

                  return (
                    <button
                      key={dispute.id}
                      type="button"
                      onClick={() => setSelectedDisputeId(dispute.id)}
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
                            <Badge className={cn("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", statusStyles[dispute.status])}>
                              {dispute.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{dispute.reasonCode}</span>
                          </div>
                          <p className="font-semibold">{dispute.booking?.addressLine ?? "Booking dispute"}</p>
                          <p className="max-w-3xl text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground md:text-right">
                          <p>Booking {dispute.bookingId}</p>
                          <p>Raised {formatDate(dispute.createdAt)}</p>
                          <p>{dispute.raisedByUser?.name ?? dispute.raisedByUserId}</p>
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
            {selectedDispute ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Scale className="size-5 text-primary" />
                    <h2 className="text-xl font-heading font-bold">Case {selectedDispute.id.slice(0, 8)}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedDispute.booking?.city ?? "Unknown city"} • {selectedDispute.booking?.categoryId ?? "Unknown category"}</p>
                </div>

                <div className="grid gap-3 rounded-3xl border border-border/60 bg-muted/20 p-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Raised by:</span>{" "}
                    {selectedDispute.raisedByUser?.name ?? selectedDispute.raisedByUserId}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Against:</span>{" "}
                    {selectedDispute.againstUser?.name ?? selectedDispute.againstUserId ?? "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current status:</span>{" "}
                    {selectedDispute.status}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Booking:</span>{" "}
                    {selectedDispute.bookingId}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Description</p>
                  <p className="rounded-3xl border border-border/60 bg-card/40 p-4 text-sm leading-6 text-muted-foreground">{selectedDispute.description}</p>
                </div>

                <div className="space-y-4 rounded-3xl border border-border/60 bg-card/30 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium">
                      <span>Status</span>
                      <select
                        value={formState.status}
                        onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as DisputeStatus }))}
                        className="h-12 w-full rounded-2xl border border-border/50 bg-background px-4 outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      >
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium">
                      <span>Resolution type</span>
                      <select
                        value={formState.resolutionType}
                        onChange={(event) => setFormState((current) => ({ ...current, resolutionType: event.target.value as NonNullable<DisputeRecord["resolutionType"]> }))}
                        className="h-12 w-full rounded-2xl border border-border/50 bg-background px-4 outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                      >
                        <option value="refund_full">Refund full</option>
                        <option value="refund_partial">Refund partial</option>
                        <option value="no_refund">No refund</option>
                        <option value="credit_note">Credit note</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                  </div>

                  <label className="space-y-2 text-sm font-medium">
                    <span>Resolution amount</span>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formState.resolutionAmount}
                      onChange={(event) => setFormState((current) => ({ ...current, resolutionAmount: event.target.value }))}
                      placeholder="Leave empty if no monetary adjustment is needed"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium">
                    <span>Admin notes</span>
                    <Textarea
                      value={formState.adminNotes}
                      onChange={(event) => setFormState((current) => ({ ...current, adminNotes: event.target.value }))}
                      placeholder="Summarize investigation findings and the final decision."
                      className="min-h-28 rounded-2xl"
                    />
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      {selectedDispute.resolvedAt ? `Resolved ${formatDate(selectedDispute.resolvedAt)}` : "Awaiting resolution"}
                    </div>
                    <Button className="rounded-2xl font-semibold" onClick={() => void updateDispute()} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Save decision
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Operational note</p>
                  <p className="mt-1">This view now uses the live disputes API. Message threads and bulk triage can be added next once the single-case workflow is validated.</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center rounded-3xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground" style={{ minHeight: "25.5rem" }}>
                Select a dispute to review its details and resolution controls.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card border-dashed border-border/70">
        <CardContent className="flex items-start gap-3 p-5">
          <CircleAlert className="mt-1 size-5 text-amber-600" />
          <div className="space-y-1">
            <p className="font-semibold">Next extension</p>
            <p className="text-sm text-muted-foreground">After this case console is stable, add a dispute message thread and attach refund execution to the resolution action.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
