"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import { usePayments } from "@/lib/api/queries";
import type { Payment } from "@/lib/api/types";
import { formatPercent, formatToman } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = usePayments({ search });

  const columns = useMemo<ColumnDef<Payment>[]>(
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
        header: "نوع",
        cell: ({ row }) => (
          <Badge variant={row.original.paymentType === 2 ? "info" : "secondary"}>
            {row.original.paymentType === 2 ? "اقساط" : "نقدی"}
          </Badge>
        ),
      },
      {
        header: "مبلغ",
        cell: ({ row }) => formatToman(row.original.totalAmount),
      },
      {
        header: "وصول",
        cell: ({ row }) => (
          <div className="w-36 space-y-1">
            <Progress value={row.original.paidPercentage} />
            <p className="text-[11px] text-muted-foreground">{formatPercent(row.original.paidPercentage)}</p>
          </div>
        ),
      },
      {
        header: "وضعیت",
        cell: ({ row }) => (
          <Badge variant={row.original.verified ? "success" : "warning"}>{row.original.paymentStatus}</Badge>
        ),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link href={routes.payment(row.original.id)}>بررسی</Link>
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
        title="پرداخت‌ها و رسیدها"
        description="فیش کارت‌به‌کارت، چک و اقساط را اینجا تأیید یا رد کنید."
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
            searchPlaceholder="جستجوی پرداخت…"
          />
        )}
      </div>
    </div>
  );
}
