"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
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
import { enrollmentStatusMeta } from "@/lib/api/mock/seed";
import { useCustomers } from "@/lib/api/queries";
import { ENROLLMENT_STATUS, type CustomerListItem } from "@/lib/api/types";
import { formatJalaliDate, formatJalaliDateTime, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

const statusFilters = [
  { value: "all", label: "همه مراحل" },
  { value: String(ENROLLMENT_STATUS.INITIAL), label: enrollmentStatusMeta[ENROLLMENT_STATUS.INITIAL].label },
  { value: String(ENROLLMENT_STATUS.THINKING), label: enrollmentStatusMeta[ENROLLMENT_STATUS.THINKING].label },
  { value: String(ENROLLMENT_STATUS.NO_ANSWER), label: enrollmentStatusMeta[ENROLLMENT_STATUS.NO_ANSWER].label },
  { value: String(ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION), label: enrollmentStatusMeta[ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION].label },
  { value: String(ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT), label: enrollmentStatusMeta[ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT].label },
  { value: String(ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION), label: enrollmentStatusMeta[ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION].label },
  { value: String(ENROLLMENT_STATUS.CONFIRMED), label: enrollmentStatusMeta[ENROLLMENT_STATUS.CONFIRMED].label },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { data = [], isLoading } = useCustomers({
    search,
    status: status === "all" ? undefined : status,
  });

  const columns = useMemo<ColumnDef<CustomerListItem>[]>(
    () => [
      {
        header: "مشتری",
        cell: ({ row }) => (
          <div className="text-right">
            <p className="font-semibold">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-xs text-muted-foreground" dir="ltr">
              {row.original.phoneNumber}
            </p>
          </div>
        ),
      },
      {
        header: "بوت‌کمپ جاری",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.activeBootcampTitle ?? "—"}
          </span>
        ),
      },
      {
        header: "مرحله ثبت‌نام",
        cell: ({ row }) =>
          row.original.activeEnrollmentStatus != null ? (
            <EnrollmentStatusBadge status={row.original.activeEnrollmentStatus} />
          ) : (
            <Badge variant="secondary">بدون ثبت‌نام</Badge>
          ),
      },
      {
        header: "تماس / یادداشت",
        cell: ({ row }) => (
          <div className="text-right text-xs text-muted-foreground">
            <p>
              {toFa(row.original.callsCount)} تماس · {toFa(row.original.notesCount)} یادداشت
            </p>
            <p className="mt-0.5">
              {row.original.lastCallAt
                ? `آخرین تماس: ${formatJalaliDateTime(row.original.lastCallAt)}`
                : "هنوز تماسی ثبت نشده"}
            </p>
          </div>
        ),
      },
      {
        header: "عضویت",
        cell: ({ row }) => formatJalaliDate(row.original.createdAt),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link href={routes.customer(row.original.id)}>پرونده</Link>
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
        title="مشتریان"
        description={`${toFa(data.length)} مشتری — یادداشت، تاریخچه تماس و کنترل مراحل ثبت‌نام بوت‌کمپ.`}
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
            searchPlaceholder="نام، موبایل یا ایمیل…"
            toolbar={
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="فیلتر مرحله" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        )}
      </div>
    </div>
  );
}
