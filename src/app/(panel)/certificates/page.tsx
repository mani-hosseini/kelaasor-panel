"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import { mockStore } from "@/lib/api/mock/store";
import { useCertificates, useIssueCertificate, useRevokeCertificate } from "@/lib/api/queries";
import { ENROLLMENT_STATUS, type Certificate } from "@/lib/api/types";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useCertificates({ search });
  const issue = useIssueCertificate();
  const revoke = useRevokeCertificate();

  const pendingEnrollments = mockStore
    .listEnrollments()
    .filter(
      (item) =>
        item.status === ENROLLMENT_STATUS.CONFIRMED &&
        !data.some((cert) => cert.enrollmentId === item.id && !cert.revoked),
    );

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
    [revoke],
  );

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="عملیات"
        title="گواهی‌ها"
        description={`${toFa(data.length)} گواهی — صدور خودکار پس از تأیید نهایی ثبت‌نام در سایت کلاسور.`}
        actions={
          pendingEnrollments.length > 0 ? (
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(value) =>
                  issue.mutate(Number(value), {
                    onSuccess: () => toast.success("گواهی صادر شد"),
                    onError: (error) => toast.error(error.message),
                  })
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={`صدور برای ${toFa(pendingEnrollments.length)} مورد`} />
                </SelectTrigger>
                <SelectContent>
                  {pendingEnrollments.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {userName(item.userId)} — {bootcampTitle(item.bootcampId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null
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
