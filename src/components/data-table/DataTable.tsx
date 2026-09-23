"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  toolbar?: React.ReactNode;
  empty?: string;
};

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "جستجو…",
  searchValue,
  onSearchChange,
  toolbar,
  empty = "موردی پیدا نشد.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const controlled = onSearchChange != null;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: controlled ? "" : globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: controlled ? undefined : setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const search = controlled ? searchValue : globalFilter;
  const setSearch = controlled ? onSearchChange : setGlobalFilter;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch?.(event.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-sm text-right"
        />
        {toolbar}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border" dir="rtl">
        <table className="w-full min-w-[52rem] text-right text-sm">
          <thead className="bg-muted/70 text-muted-foreground">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border/80 hover:bg-brand-50/40 dark:hover:bg-brand-900/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>
          صفحه {toFa(table.getState().pagination.pageIndex + 1)} از {toFa(table.getPageCount() || 1)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronRight className="size-4" />
            قبلی
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(!table.getCanNextPage() && "opacity-50")}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            بعدی
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
