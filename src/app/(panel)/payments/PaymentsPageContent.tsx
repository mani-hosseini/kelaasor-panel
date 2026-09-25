"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import { usePayments } from "@/lib/api/queries";
import type { ListParams, Payment } from "@/lib/api/types";
import { formatPercent, formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const FILTERS: { id: NonNullable<ListParams["paymentFilter"]>; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "awaiting", label: "منتظر تأیید فیش" },
  { id: "installment", label: "اقساطی" },
];

export default function PaymentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const paymentFilter: ListParams["paymentFilter"] =
    filterParam === "awaiting" || filterParam === "installment" ? filterParam : "all";

  const [search, setSearch] = useState("");
  const { data = [], isLoading } = usePayments({ search, paymentFilter });

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
            <p className="text-[11px] text-muted-foreground">
              {formatPercent(row.original.paidPercentage)}
            </p>
          </div>
        ),
      },
      {
        header: "مدارک",
        cell: ({ row }) => {
          const awaitingInstallment = row.original.installments.some(
            (item) => item.awaitingVerification,
          );
          if (!row.original.verified && row.original.receipt) {
            return <Badge variant="warning">فیش اصلی</Badge>;
          }
          if (awaitingInstallment) {
            return <Badge variant="orange">رسید قسط</Badge>;
          }
          if (row.original.cheque) {
            return <Badge variant="info">چک</Badge>;
          }
          return <Badge variant="secondary">—</Badge>;
        },
      },
      {
        header: "وضعیت",
        cell: ({ row }) => (
          <Badge variant={row.original.verified ? "success" : "warning"}>
            {row.original.paymentStatus}
          </Badge>
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
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="عملیات"
        title="پرداخت‌ها و رسیدها"
        description={`${toFa(data.length)} مورد — فیش کارت‌به‌کارت، چک و اقساط را اینجا تأیید یا رد کنید.`}
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={paymentFilter === item.id ? "default" : "outline"}
            className={cn(paymentFilter === item.id && "pointer-events-none")}
            onClick={() => {
              const next = new URLSearchParams(searchParams.toString());
              if (item.id === "all") next.delete("filter");
              else next.set("filter", item.id);
              router.replace(`${routes.payments}${next.toString() ? `?${next}` : ""}`);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
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
