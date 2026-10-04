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
import { useBlog, useDeleteBlog } from "@/lib/api/queries";
import { BLOG_STATUS, type BlogPost } from "@/lib/api/types";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useBlog({ search });
  const remove = useDeleteBlog();

  const columns = useMemo<ColumnDef<BlogPost>[]>(
    () => [
      {
        header: "پست",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.categoryTitle}</p>
          </div>
        ),
      },
      {
        header: "وضعیت",
        cell: ({ row }) => (
          <Badge variant={row.original.status === BLOG_STATUS.PUBLISHED ? "success" : "secondary"}>
            {row.original.statusDisplay ??
              (row.original.status === BLOG_STATUS.PUBLISHED ? "منتشرشده" : "پیش‌نویس")}
          </Badge>
        ),
      },
      { header: "بازدید", cell: ({ row }) => toFa(row.original.viewCount) },
      {
        header: "کامنت",
        cell: ({ row }) =>
          toFa(row.original.commentsCount || row.original.comments.length),
      },
      {
        header: "تاریخ",
        cell: ({ row }) =>
          formatJalaliDate(row.original.publishedAt ?? row.original.createdAt),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={routes.blogPost(row.original.id)}>ویرایش</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() =>
                remove.mutate(row.original.id, {
                  onSuccess: () => toast.success("حذف شد"),
                })
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
        eyebrow="محتوا"
        title="بلاگ کلاسور"
        actions={
          <Button asChild>
            <Link href={routes.blogNew}>پست جدید</Link>
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
          />
        )}
      </div>
    </div>
  );
}
