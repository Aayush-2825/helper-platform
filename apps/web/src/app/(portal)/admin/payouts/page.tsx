"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarRange, CheckCircle2, Loader2, PlayCircle, RefreshCcw, Search, XCircle } from "lucide-react";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "reversed";

type AdminPayout = {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  provider: string;
  providerTransferId?: string | null;
  processedAt?: string | null;
  failedReason?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
  helperProfileId: string;
  helperUserId: string;
  helperName: string;
  helperEmail: string;
  serviceCity?: string | null;
  primaryCategory: string;
};

type PayoutsResponse = {
  payouts: AdminPayout[];
  summary: {
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    failedCount: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function money(amount: number, currency = "INR") {
  if (currency !== "INR") {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }

  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function fetchPayouts(params: {
  page: number;
  pageSize: number;
  search: string;
  status: "all" | PayoutStatus;
  from: string;
  to: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    status: params.status,
  });

  if (params.search.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.from) {
    query.set("from", params.from);
  }

  if (params.to) {
    query.set("to", params.to);
  }

  const response = await fetch(`/api/admin/payouts?${query.toString()}`, {
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({}))) as
    | PayoutsResponse
    | { message?: string };

  if (!response.ok) {
    throw new Error("message" in payload ? payload.message ?? "Could not load payouts." : "Could not load payouts.");
  }

  return payload as PayoutsResponse;
}

export default function AdminPayoutsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PayoutStatus>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const pageSize = 20;

  const payoutsQuery = useQuery({
    queryKey: ["admin", "payouts", { page, pageSize, search, statusFilter, from, to }],
    queryFn: () => fetchPayouts({ page, pageSize, search, status: statusFilter, from, to }),
    placeholderData: (previousData) => previousData,
  });

  const rows = payoutsQuery.data?.payouts ?? [];
  const summary = payoutsQuery.data?.summary;
  const pagination = payoutsQuery.data?.pagination;

  const updatePayoutStatus = async (input: {
    payoutId: string;
    status: Exclude<PayoutStatus, "pending">;
    providerTransferId?: string;
    failedReason?: string;
  }) => {
    try {
      setActionLoadingId(input.payoutId);

      const response = await fetch(`/api/admin/payouts/${input.payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: input.status,
          providerTransferId: input.providerTransferId,
          failedReason: input.failedReason,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update payout status.");
      }

      toast.success(payload.message ?? "Payout updated.");
      await payoutsQuery.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payout update failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = useMemo<ColumnDef<AdminPayout>[]>(
    () => [
      {
        id: "helper",
        header: "Helper",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-semibold tracking-tight">{row.original.helperName}</p>
            <p className="text-xs text-muted-foreground">{row.original.helperEmail}</p>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{money(row.original.amount, row.original.currency)}</p>
            <p className="text-xs text-muted-foreground">{row.original.provider}</p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              row.original.status === "paid" &&
                "border-green-200 bg-green-100 text-green-800 dark:border-green-600/40 dark:bg-green-600/20 dark:text-green-300",
              (row.original.status === "pending" || row.original.status === "processing") &&
                "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-600/40 dark:bg-amber-600/20 dark:text-amber-300",
              (row.original.status === "failed" || row.original.status === "reversed") &&
                "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "period",
        header: "Period",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{formatDate(row.original.periodStart)} to {formatDate(row.original.periodEnd)}</p>
            <p>Created {formatDate(row.original.createdAt)}</p>
            <p>Processed {formatDate(row.original.processedAt)}</p>
          </div>
        ),
      },
      {
        id: "details",
        header: "Details",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="truncate">Transfer {row.original.providerTransferId ?? "-"}</p>
            <p className="truncate">{row.original.serviceCity ?? "Unknown city"} • {row.original.primaryCategory}</p>
            {row.original.failedReason ? <p className="text-destructive">{row.original.failedReason}</p> : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original;
          const isLoading = actionLoadingId === record.id;

          if (record.status === "paid" || record.status === "failed" || record.status === "reversed") {
            return <p className="text-xs text-muted-foreground">Closed</p>;
          }

          if (record.status === "pending") {
            return (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
                disabled={isLoading}
                onClick={() => void updatePayoutStatus({ payoutId: record.id, status: "processing" })}
              >
                {isLoading ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <PlayCircle className="mr-1 size-3.5" />}
                Start
              </Button>
            );
          }

          const markPaid = async () => {
            const transferId = window.prompt("Enter provider transfer reference ID");
            if (!transferId?.trim()) {
              toast.error("Transfer reference is required to mark paid.");
              return;
            }
            await updatePayoutStatus({
              payoutId: record.id,
              status: "paid",
              providerTransferId: transferId.trim(),
            });
          };

          const markFailed = async () => {
            const reason = window.prompt("Enter failure reason");
            if (!reason?.trim()) {
              toast.error("Failure reason is required.");
              return;
            }
            await updatePayoutStatus({
              payoutId: record.id,
              status: "failed",
              failedReason: reason.trim(),
            });
          };

          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 rounded-lg"
                disabled={isLoading}
                onClick={() => void markPaid()}
              >
                {isLoading ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <CheckCircle2 className="mr-1 size-3.5" />}
                Paid
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
                disabled={isLoading}
                onClick={() => void markFailed()}
              >
                <XCircle className="mr-1 size-3.5" />
                Fail
              </Button>
            </div>
          );
        },
      },
    ],
    [actionLoadingId],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">Payout Operations</h1>
          <p className="text-sm text-muted-foreground">Monitor withdrawal queues, settlement lifecycle, and transfer failures.</p>
        </div>
        <Button
          variant="outline"
          className="h-11 rounded-2xl font-semibold"
          onClick={() => payoutsQuery.refetch()}
          disabled={payoutsQuery.isFetching}
        >
          {payoutsQuery.isFetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Total Payout Amount</p>
            <p className="text-2xl font-bold">{summary ? money(summary.totalAmount) : "-"}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Pending/Processing</p>
            <p className="text-2xl font-bold">{summary ? money(summary.pendingAmount) : "-"}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Paid Amount</p>
            <p className="text-2xl font-bold">{summary ? money(summary.paidAmount) : "-"}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Failed/Reversed</p>
            <p className="text-2xl font-bold">{summary?.failedCount ?? "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card-strong border-none">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search payout, helper, transfer ID..."
                className="h-12 pl-11"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as "all" | PayoutStatus);
                  setPage(1);
                }}
                className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="reversed">Reversed</option>
              </select>

              <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-card/60 px-3">
                <CalendarRange className="size-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 border-none bg-transparent px-0"
                />
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-card/60 px-3">
                <CalendarRange className="size-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 border-none bg-transparent px-0"
                />
              </div>
            </div>
          </div>

          <AdminDataTable
            data={rows}
            columns={columns}
            loading={payoutsQuery.isLoading}
            error={payoutsQuery.error instanceof Error ? payoutsQuery.error.message : null}
            emptyMessage="No payouts match your filters."
            page={pagination?.page ?? page}
            pageSize={pagination?.pageSize ?? pageSize}
            total={pagination?.total ?? 0}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
