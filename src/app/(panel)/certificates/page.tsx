"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLookups } from "@/lib/api/lookups";
import { useCertificates, useIssueCertificate, useRevokeCertificate } from "@/lib/api/queries";
import type { Certificate } from "@/lib/api/types";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const { data = [], isLoading } = useCertificates({ search });
  const issue = useIssueCertificate();
  const revoke = useRevokeCertificate();
  const { userName, bootcampTitle } = useAdminLookups();

  const columns = useMemo<ColumnDef<Certificate>[]>(
    () => [
      {
        header: "دانشجو",
        cell: ({ row }) => userName(row.original.userId),
      },
      {
        header: "بوت‌کمپ",
        cell: ({ row }) => bootcampTitle(row.original.bootcampId),
      },
      {
        header: "عنوان گواهی",
        cell: ({ row }) => row.original.title,
      },
      {
        header: "صدور",
        cell: ({ row }) => formatJalaliDate(row.original.issuedAt),
      },
      {
        header: "وضعیت",
        cell: ({ row }) => (
          <Badge variant={row.original.revoked ? "danger" : "success"}>
            {row.original.revoked ? "باطل‌شده" : "فعال"}
          </Badge>
        ),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={routes.customer(row.original.userId)}>مشتری</Link>
            </Button>
            {!row.original.revoked ? (
              <Button
                size="sm"
                variant="destructive"
                disabled={revoke.isPending}
                onClick={() =>
                  revoke.mutate(row.original.id, {
                    onSuccess: () => toast.success("گواهی باطل شد"),
                    onError: (error) => toast.error(error.message),
                  })
                }
              >
                ابطال
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [revoke, userName, bootcampTitle],
  );

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="عملیات"
        title="گواهی‌ها"
        description={`${toFa(data.length)} گواهی — لیست از API؛ صدور دستی با شناسه ثبت‌نام.`}
        actions={
          <div className="flex items-center gap-2">
            <Input
              dir="ltr"
              className="w-40"
              placeholder="enrollment id"
              value={enrollmentId}
              onChange={(event) => setEnrollmentId(event.target.value)}
            />
            <Button
              size="sm"
              disabled={issue.isPending || !enrollmentId.trim()}
              onClick={() => {
                const id = Number(enrollmentId);
                if (!Number.isFinite(id) || id <= 0) {
                  toast.error("شناسه ثبت‌نام معتبر نیست");
                  return;
                }
                issue.mutate(id, {
                  onSuccess: () => {
                    toast.success("گواهی صادر شد");
                    setEnrollmentId("");
                  },
                  onError: (error) => toast.error(error.message),
                });
              }}
            >
              صدور
            </Button>
          </div>
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
            searchPlaceholder="نام دانشجو یا بوت‌کمپ…"
          />
        )}
      </div>
    </div>
  );
}
