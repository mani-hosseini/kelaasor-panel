"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/DataTable";
import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import { enrollmentStatusMeta } from "@/lib/api/mock/seed";
import { useBootcamps, useEnrollments } from "@/lib/api/queries";
import type { Enrollment } from "@/lib/api/types";
import { formatJalaliDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function EnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [bootcampId, setBootcampId] = useState<string>("all");
  const params = {
    search,
    status: status === "all" ? undefined : Number(status),
    bootcampId: bootcampId === "all" ? undefined : Number(bootcampId),
  };
  const { data = [], isLoading } = useEnrollments(params);
  const bootcamps = useBootcamps();

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        header: "دانشجو",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{userName(row.original.userId)}</p>
            <p className="text-xs text-muted-foreground">#{row.original.id}</p>
          </div>
        ),
      },
      {
        header: "بوت‌کمپ",
        cell: ({ row }) => bootcampTitle(row.original.bootcampId),
      },
      {
        header: "وضعیت",
        cell: ({ row }) => <EnrollmentStatusBadge status={row.original.status} />,
      },
      {
        header: "گام بعدی",
        cell: ({ row }) => (
          <Badge variant={row.original.nextStepBy === 1 ? "orange" : "secondary"}>
            {row.original.nextStepByDisplay}
          </Badge>
        ),
      },
      {
        header: "تاریخ",
        cell: ({ row }) => formatJalaliDateTime(row.original.enrolledAt),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link href={routes.enrollment(row.original.id)}>جزئیات</Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="عملیات"
        title="صف ثبت‌نام بوت‌کمپ"
        description="از پیش‌ثبت‌نام تا تأیید نهایی؛ موارد با گام بعدی ادمین را اول بررسی کنید."
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
            searchPlaceholder="نام، موبایل یا بوت‌کمپ…"
            toolbar={
              <div className="flex flex-wrap gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    {Object.entries(enrollmentStatusMeta).map(([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={bootcampId} onValueChange={setBootcampId}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="بوت‌کمپ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه بوت‌کمپ‌ها</SelectItem>
                    {(bootcamps.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
