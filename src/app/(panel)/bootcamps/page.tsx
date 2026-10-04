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
import { useBootcamps, useDeleteBootcamp, useTopics } from "@/lib/api/queries";
import type { Bootcamp } from "@/lib/api/types";
import { formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function BootcampsPage() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useBootcamps({ search });
  const { data: topics = [] } = useTopics();
  const remove = useDeleteBootcamp();

  const topicTitleById = useMemo(() => {
    const map = new Map<number, string>();
    for (const topic of topics) map.set(topic.id, topic.title);
    return map;
  }, [topics]);

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
        cell: ({ row }) => topicTitleById.get(row.original.topicId) ?? "—",
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
                remove.mutate(row.original.id, {
                  onSuccess: () => toast.success("بوت‌کمپ حذف شد"),
                  onError: (error) =>
                    toast.error(
                      error instanceof Error ? error.message : "حذف ممکن نشد",
                    ),
                })
              }
            >
              حذف
            </Button>
          </div>
        ),
      },
    ],
    [remove, topicTitleById],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="آموزش"
        title="بوت‌کمپ‌ها"
        description="وضعیت ثبت‌نام، سیلابس و قیمت را از اینجا ببینید. موضوع‌ها، حامی‌ها و شرکا از تب‌های بالا مدیریت می‌شوند."
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
