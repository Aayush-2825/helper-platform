"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldX,
  UserRoundPlus,
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

type UserRole = "admin" | "helper" | "customer";
type UserStatus = "active" | "pending" | "suspended";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  status: UserStatus;
  bookingCount: number;
  totalSpent: number;
  helperProfile: {
    id: string;
    isActive: boolean;
    verificationStatus: string;
    availabilityStatus: string;
    serviceCity?: string | null;
    averageRating: number;
    completedJobs: number;
  } | null;
};

type UsersResponse = {
  users: AdminUser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function money(amount: number): string {
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function fetchUsers(params: {
  page: number;
  pageSize: number;
  search: string;
  role: "all" | "admin" | "helper" | "customer";
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    role: params.role,
  });

  if (params.search.trim()) {
    query.set("search", params.search.trim());
  }

  const response = await fetch(`/api/admin/users?${query.toString()}`, {
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({}))) as
    | UsersResponse
    | { message?: string };

  if (!response.ok) {
    throw new Error("message" in payload ? payload.message ?? "Could not load users." : "Could not load users.");
  }

  return payload as UsersResponse;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "helper" | "customer">("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const usersQuery = useQuery({
    queryKey: ["admin", "users", { page, pageSize, search, roleFilter }],
    queryFn: () => fetchUsers({ page, pageSize, search, role: roleFilter }),
    placeholderData: (previousData) => previousData,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: "suspend" | "activate" }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Could not update user account.");
      }

      return payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const rows = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-semibold tracking-tight">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">ID {row.original.id.slice(0, 8)}</p>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p className="inline-flex items-center gap-1.5 font-medium">
              <Mail className="size-3.5 text-primary" />
              {row.original.email}
            </p>
            <p className="text-xs text-muted-foreground">{row.original.phone ?? "No phone"}</p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary">
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              row.original.status === "active" &&
                "border-green-200 bg-green-100 text-green-800 dark:border-green-600/40 dark:bg-green-600/20 dark:text-green-300",
              row.original.status === "pending" &&
                "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-600/40 dark:bg-amber-600/20 dark:text-amber-300",
              row.original.status === "suspended" &&
                "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "activity",
        header: "Activity",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{row.original.bookingCount} bookings</p>
            <p>{money(row.original.totalSpent)} spend</p>
            <p>Joined {formatDate(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        id: "security",
        header: "Security",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <p className={cn("font-medium", row.original.emailVerified ? "text-green-700 dark:text-green-300" : "text-muted-foreground")}>
              Email {row.original.emailVerified ? "verified" : "unverified"}
            </p>
            <p className={cn("font-medium", row.original.twoFactorEnabled ? "text-primary" : "text-muted-foreground")}>
              2FA {row.original.twoFactorEnabled ? "enabled" : "disabled"}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isHelper = row.original.role === "helper";
          const isSuspended = row.original.status === "suspended";

          return (
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
                  {isHelper ? (
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 p-3 font-semibold"
                      disabled={actionMutation.isPending}
                      onClick={() =>
                        actionMutation.mutate({
                          userId: row.original.id,
                          action: isSuspended ? "activate" : "suspend",
                        })
                      }
                    >
                      {isSuspended ? <ShieldCheck className="size-4" /> : <ShieldX className="size-4" />}
                      {isSuspended ? "Activate helper" : "Suspend helper"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem className="p-3 text-muted-foreground" disabled>
                      No admin action
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [actionMutation],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-black tracking-tight">User Directory</h1>
          <p className="text-sm text-muted-foreground">Manage accounts, helper access, and account security posture.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-11 rounded-2xl font-semibold"
            onClick={() => usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            {usersQuery.isFetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
            Refresh
          </Button>
          <Button className="h-11 rounded-2xl font-semibold" disabled>
            <UserRoundPlus className="mr-2 size-4" />
            Invite User
          </Button>
        </div>
      </div>

      {actionMutation.error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {(actionMutation.error as Error).message}
        </div>
      )}

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
                placeholder="Search by name, email, or user ID..."
                className="h-12 pl-11"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as "all" | "admin" | "helper" | "customer");
                setPage(1);
              }}
              className="h-12 rounded-2xl border border-border/50 bg-card/60 px-4 text-sm font-medium outline-none transition-all focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="helper">Helper</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <AdminDataTable
            data={rows}
            columns={columns}
            loading={usersQuery.isLoading}
            error={usersQuery.error instanceof Error ? usersQuery.error.message : null}
            emptyMessage="No users match your filters."
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
