import React from "react";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
}

// Create Table component (shadcn doesn't have this by default)
export function Table<T>({
  data,
  columns,
  loading = false,
  emptyState,
  className,
  rowClassName,
  onRowClick,
  keyExtractor,
}: TableProps<T>) {
  // Handle empty or loading state
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      {/* Desktop View - Regular Table */}
      <div className="hidden md:block">
        <ShadcnTable>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className={cn(
                  rowClassName?.(item),
                  onRowClick ? "cursor-pointer hover:bg-muted" : ""
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex}>
                    {column.cell
                      ? column.cell(item)
                      : column.accessorKey
                      ? (item[column.accessorKey] as React.ReactNode)
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>

      {/* Mobile View - Card-based Layout */}
      <div className="space-y-4 md:hidden">
        {data.map((item) => (
          <Card
            key={keyExtractor(item)}
            className={cn(
              "p-4",
              rowClassName?.(item),
              onRowClick ? "cursor-pointer hover:bg-muted" : ""
            )}
            onClick={() => onRowClick?.(item)}
          >
            <div className="space-y-3">
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex items-start justify-between">
                  <div className="text-sm text-muted-foreground">
                    {column.header}
                  </div>
                  <div className="text-sm font-medium text-right">
                    {column.cell
                      ? column.cell(item)
                      : column.accessorKey
                      ? (item[column.accessorKey] as React.ReactNode)
                      : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 