"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockStore } from "@/lib/api/mock/store";
import { useBootcamps, useDeleteBootcamp } from "@/lib/api/queries";
import type { Bootcamp } from "@/lib/api/types";
import { formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function BootcampsPage() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useBootcamps({ search });
  const remove = useDeleteBootcamp();

  const columns = useMemo<ColumnDef<Bootcamp>[]>(
    () => [
      {
        header: "بوت‌کمپ",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.brief}</p>
          </div>
        ),
      },
      {
        header: "موضوع",
        cell: ({ row }) => mockStore.listTopics().find((t) => t.id === row.original.topicId)?.title,
      },
      {
        header: "وضعیت ثبت‌نام",
        cell: ({ row }) =>
          row.original.currentEvent ? (
            <Badge variant="success">{row.original.currentEvent.statusDisplay}</Badge>
          ) : (
            <Badge variant="secondary">بدون رویداد</Badge>
          ),
      },
      {
        header: "ظرفیت",
        cell: ({ row }) =>
          `${toFa(row.original.currentEvent?.confirmedEnrollmentsCount ?? 0)} / ${toFa(row.original.capacity)}`,
      },
      {
        header: "قیمت",
        cell: ({ row }) => formatToman(row.original.currentEvent?.finalPrice ?? null),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={routes.bootcamp(row.original.id)}>جزئیات</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() =>
                remove.mutate(row.original.id, { onSuccess: () => toast.success("بوت‌کمپ حذف شد") })
              }
            >
              حذف
            </Button>
          </div>
        ),
      },
    ],
    [remove],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="آموزش"
        title="بوت‌کمپ‌ها"
        description="وضعیت ثبت‌نام، سیلابس، مدرس و قیمت را از اینجا مدیریت کنید."
        actions={
          <Button asChild>
            <Link href={routes.bootcampNew}>بوت‌کمپ جدید</Link>
          </Button>
        }
      />
      <div className="surface-panel p-5">
        {isLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="جستجوی بوت‌کمپ…"
          />
        )}
      </div>
    </div>
  );
}
