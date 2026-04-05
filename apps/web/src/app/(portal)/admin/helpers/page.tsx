"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Star,
} from "lucide-react";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HelperStatus = "active" | "pending" | "suspended";

type AdminHelper = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  primaryCategory: string;
  serviceCity?: string | null;
  verificationStatus: "pending" | "approved" | "rejected" | "resubmission_required";
  availabilityStatus: "online" | "busy" | "offline";
  isActive: boolean;
  averageRating: number;
  totalRatings: number;
  completedJobs: number;
  qualityScore: number;
  statusLabel: HelperStatus;
  createdAt: string;
};

type HelpersResponse = {
  helpers: AdminHelper[];
  summary: {
    total: number;
    active: number;
    approved: number;
    online: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

async function fetchHelpers(params: {
  page: number;
  pageSize: number;
  search: string;
  verificationStatus: "all" | "pending" | "approved" | "rejected" | "resubmission_required";
  active: "all" | "true" | "false";
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    verificationStatus: params.verificationStatus,
    active: params.active,
  });

  if (params.search.trim()) {
    query.set("search", params.search.trim());
  }

  const response = await fetch(`/api/admin/helpers?${query.toString()}`, {
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({}))) as
    | HelpersResponse
    | { message?: string };

  if (!response.ok) {
    throw new Error("message" in payload ? payload.message ?? "Could not load helpers." : "Could not load helpers.");
  }

  return payload as HelpersResponse;
}

export default function AdminHelpersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "all" | "pending" | "approved" | "rejected" | "resubmission_required"
  >("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const helpersQuery = useQuery({
    queryKey: ["admin", "helpers", { page, pageSize, search, verificationStatus, activeFilter }],
    queryFn: () =>
      fetchHelpers({
        page,
        pageSize,
        search,
        verificationStatus,
        active: activeFilter,
      }),
    placeholderData: (previousData) => previousData,
  });

  const availabilityMutation = useMutation({
    mutationFn: async ({ helperId, availabilityStatus }: { helperId: string; availabilityStatus: AdminHelper["availabilityStatus"] }) => {
      const response = await fetch(`/api/admin/helpers/${helperId}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ availabilityStatus }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Could not update helper availability.");
      }

      return payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "helpers"] });
    },
  });

  const rows = helpersQuery.data?.helpers ?? [];
  const pagination = helpersQuery.data?.pagination;

  const columns = useMemo<ColumnDef<AdminHelper>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Helper",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-semibold tracking-tight">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p className="font-medium capitalize">{row.original.primaryCategory}</p>
            <p className="text-xs text-muted-foreground">{row.original.serviceCity ?? "Unknown city"}</p>
          </div>
        ),
      },
      {
        id: "quality",
        header: "Quality",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <Star className="size-3.5 text-primary" />
              {row.original.averageRating.toFixed(2)} ({row.original.totalRatings})
            </p>
            <p>{row.original.completedJobs} jobs completed</p>
            <p>QS {row.original.qualityScore}</p>
          </div>
        ),
      },
      {
        id: "verification",
        header: "Verification",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              row.original.verificationStatus === "approved" &&
                "border-green-200 bg-green-100 text-green-800 dark:border-green-600/40 dark:bg-green-600/20 dark:text-green-300",
              row.original.verificationStatus === "pending" &&
                "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-600/40 dark:bg-amber-600/20 dark:text-amber-300",
              row.original.verificationStatus === "resubmission_required" &&
                "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-600/40 dark:bg-blue-600/20 dark:text-blue-300",
              row.original.verificationStatus === "rejected" &&
                "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {row.original.verificationStatus.replaceAll("_", " ")}
          </Badge>
        ),
      },
      {
        id: "availability",
        header: "Availability",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              row.original.availabilityStatus === "online" &&
                "border-green-200 bg-green-100 text-green-800 dark:border-green-600/40 dark:bg-green-600/20 dark:text-green-300",
              row.original.availabilityStatus === "busy" &&
                "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-600/40 dark:bg-amber-600/20 dark:text-amber-300",
              row.original.availabilityStatus === "offline" &&
                "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600/40 dark:bg-slate-600/20 dark:text-slate-300",
            )}
          >
            {row.original.availabilityStatus}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(props) => (
                  <Button {...props} variant="ghost" size="icon" className="rounded-xl size-9 hover:bg-primary/5">
                    <MoreHorizontal className="size-5" />
                  </Button>
                )}
              />
              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl">
                <DropdownMenuItem
                  className="cursor-pointer gap-2 p-3 font-semibold"
                  onClick={() =>
                    availabilityMutation.mutate({ helperId: row.original.id, availabilityStatus: "online" })
                  }
                  disabled={availabilityMutation.isPending}
                >
                  <CheckCircle2 className="size-4" />
                  Set Online
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer p-3 font-semibold"
                  onClick={() =>
                    availabilityMutation.mutate({ helperId: row.original.id, availabilityStatus: "offline" })
                  }
                  disabled={availabilityMutation.isPending}
                >
                  Set Offline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [availabilityMutation],
  );

  const summary = helpersQuery.data?.summary;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">Helper Network</h1>
          <p className="text-sm text-muted-foreground">Monitor verification, availability, and quality across the helper fleet.</p>
        </div>
        <Button
          variant="outline"
          className="h-11 rounded-2xl font-semibold"
          onClick={() => helpersQuery.refetch()}
          disabled={helpersQuery.isFetching}
        >
          {helpersQuery.isFetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
          Refresh
        </Button>
      </div>

      {availabilityMutation.error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {(availabilityMutation.error as Error).message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Total Helpers</p>
            <p className="text-2xl font-bold">{summary?.total ?? "-"}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{summary?.active ?? "-"}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold">{summary?.approved ?? "-"}</p>
          </CardContent>
        </Card>
        <Card className="surface-card-strong border-none">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Online</p>
            <p className="text-2xl font-bold">{summary?.online ?? "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card-strong border-none">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, city, category, or helper ID..."
                className="h-12 pl-11"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={verificationStatus}
                onChange={(event) => {
                  setVerificationStatus(
                    event.target.value as
                      | "all"
                      | "pending"
                      | "approved"
                      | "rejected"
                      | "resubmission_required",
                  );
                  setPage(1);
                }}
                className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <option value="all">All verification</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="resubmission_required">Resubmission</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value as "all" | "true" | "false");
                  setPage(1);
                }}
                className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <option value="all">All activity</option>
                <option value="true">Active only</option>
                <option value="false">Suspended only</option>
              </select>
            </div>
          </div>

          <AdminDataTable
            data={rows}
            columns={columns}
            loading={helpersQuery.isLoading}
            error={helpersQuery.error instanceof Error ? helpersQuery.error.message : null}
            emptyMessage="No helpers match your filters."
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
