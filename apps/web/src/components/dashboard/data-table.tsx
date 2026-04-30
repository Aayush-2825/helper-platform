"use client";

import { ReactNode, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/ui/button";

export type SortDirection = "asc" | "desc" | null;

export interface DataTableColumn<T> {
  id: string;
  label: string;
  sortable?: boolean;
  render: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onSort?: (columnId: string, direction: SortDirection) => void;
  sortColumn?: string;
  sortDirection?: SortDirection;
  isLoading?: boolean;
  emptyState?: ReactNode;
  rowHoverEffect?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onSort,
  sortColumn,
  sortDirection,
  isLoading = false,
  emptyState,
  rowHoverEffect = true,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<{
    column: string;
    direction: SortDirection;
  } | null>(null);

  const handleSort = (columnId: string) => {
    if (!onSort) return;

    let newDirection: SortDirection = "asc";
    if (sortColumn === columnId) {
      if (sortDirection === "asc") newDirection = "desc";
      else if (sortDirection === "desc") newDirection = null;
    }

    onSort(columnId, newDirection);
  };

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="h-4 w-4 opacity-40" />;
    }

    if (sortDirection === "asc") {
      return <ChevronUp className="h-4 w-4" />;
    }
    if (sortDirection === "desc") {
      return <ChevronDown className="h-4 w-4" />;
    }
    return <ChevronsUpDown className="h-4 w-4 opacity-40" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-muted rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      emptyState || (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-12">
          <p className="text-sm text-muted-foreground">No data to display</p>
        </div>
      )
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.id}
                className={cn(
                  "px-4 py-3 text-left font-semibold text-muted-foreground",
                  column.className
                )}
              >
                {column.sortable && onSort ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.id)}
                    className="h-auto gap-2 px-0 py-0 font-semibold hover:bg-transparent hover:text-foreground"
                  >
                    {column.label}
                    {getSortIcon(column.id)}
                  </Button>
                ) : (
                  <span className="flex items-center gap-2">{column.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={cn(
                "border-b border-border last:border-b-0 transition-colors",
                rowHoverEffect && "hover:bg-muted/30"
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn("px-4 py-3", column.className)}
                >
                  {column.render(item, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
