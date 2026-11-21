"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Bell, Copy, Phone, Star } from "lucide-react";
import { toast } from "sonner";

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
import { enrollmentStatusMeta } from "@/lib/api/labels";
import { useBootcamps, useCustomers, useEnrollments, useToggleCustomerStar } from "@/lib/api/queries";
import {
  ENROLLMENT_STATUS,
  type CustomerListItem,
  type ListParams,
} from "@/lib/api/types";
import { formatJalaliDate, formatJalaliDateTime, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "همه مراحل" },
  { value: String(ENROLLMENT_STATUS.INITIAL), label: enrollmentStatusMeta[ENROLLMENT_STATUS.INITIAL].label },
  { value: String(ENROLLMENT_STATUS.THINKING), label: enrollmentStatusMeta[ENROLLMENT_STATUS.THINKING].label },
  { value: String(ENROLLMENT_STATUS.NO_ANSWER), label: enrollmentStatusMeta[ENROLLMENT_STATUS.NO_ANSWER].label },
  {
    value: String(ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION),
    label: enrollmentStatusMeta[ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION].label,
  },
  {
    value: String(ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT),
    label: enrollmentStatusMeta[ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT].label,
  },
  {
    value: String(ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION),
    label: enrollmentStatusMeta[ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION].label,
  },
  { value: String(ENROLLMENT_STATUS.CONFIRMED), label: enrollmentStatusMeta[ENROLLMENT_STATUS.CONFIRMED].label },
];

const crmFilters: { value: NonNullable<ListParams["crmFilter"]>; label: string }[] = [
  { value: "all", label: "همه مشتریان" },
  { value: "starred", label: "نشان‌شده" },
  { value: "followup", label: "پیگیری امروز/معوق" },
  { value: "overdue", label: "از موعد گذشته" },
  { value: "cold", label: "بدون تماس ۷ روز" },
];

function followUpBadge(state: CustomerListItem["followUpState"]) {
  if (state === "overdue") return <Badge variant="danger">پیگیری معوق</Badge>;
  if (state === "today") return <Badge variant="warning">پیگیری امروز</Badge>;
  if (state === "upcoming") return <Badge variant="info">پیگیری آینده</Badge>;
  return null;
}

export function CustomersPageContent() {
  const searchParams = useSearchParams();
  const initialCrm = (searchParams.get("crm") as ListParams["crmFilter"]) || "all";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [crmFilter, setCrmFilter] = useState<NonNullable<ListParams["crmFilter"]>>(
    initialCrm && ["starred", "followup", "overdue", "cold"].includes(initialCrm)
      ? initialCrm
      : "all",
  );
  const [bootcampId, setBootcampId] = useState<number | "all">("all");
  const toggleStar = useToggleCustomerStar();
  const bootcampsQuery = useBootcamps();
  const bootcamps = useMemo(
    () =>
      [...(bootcampsQuery.data ?? [])].sort(
        (a, b) => a.ordering - b.ordering || a.title.localeCompare(b.title, "fa"),
      ),
    [bootcampsQuery.data],
  );
  const selectedBootcamp =
    bootcampId === "all" ? null : bootcamps.find((item) => item.id === bootcampId) ?? null;
  const enrollmentsQuery = useEnrollments(
    selectedBootcamp ? { bootcampId: selectedBootcamp.id } : undefined,
    selectedBootcamp != null,
  );

  useEffect(() => {
    const next = searchParams.get("crm") as ListParams["crmFilter"];
    if (next && ["starred", "followup", "overdue", "cold", "all"].includes(next)) {
      setCrmFilter(next);
    }
  }, [searchParams]);

  const { data = [], isLoading } = useCustomers({
    search,
    status: status === "all" ? undefined : status,
    crmFilter,
  });
  const enrolledUserIds = useMemo(() => {
    if (!selectedBootcamp) return null;
    return new Set((enrollmentsQuery.data ?? []).map((item) => item.userId));
  }, [enrollmentsQuery.data, selectedBootcamp]);
  const rows = useMemo(
    () => (enrolledUserIds ? data.filter((item) => enrolledUserIds.has(item.id)) : data),
    [data, enrolledUserIds],
  );
  const listLoading = isLoading || (selectedBootcamp != null && enrollmentsQuery.isLoading);

  const columns = useMemo<ColumnDef<CustomerListItem>[]>(
    () => [
      {
        header: "مشتری",
        cell: ({ row }) => (
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              {row.original.isStarred ? (
                <Star className="size-3.5 fill-orange text-orange" />
              ) : null}
              <p className="font-semibold">
                {row.original.firstName} {row.original.lastName}
              </p>
            </div>
            <p className="text-xs text-muted-foreground" dir="ltr">
              {row.original.phoneNumber}
            </p>
            {row.original.crmTags.length > 0 ? (
              <div className="mt-1 flex flex-wrap justify-end gap-1">
                {row.original.crmTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        header: "بوت‌کمپ / مرحله",
        cell: ({ row }) => (
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">
              {row.original.activeBootcampTitle ?? "—"}
            </p>
            {row.original.activeEnrollmentStatus != null ? (
              <EnrollmentStatusBadge status={row.original.activeEnrollmentStatus} />
            ) : (
              <Badge variant="secondary">بدون ثبت‌نام</Badge>
            )}
          </div>
        ),
      },
      {
        header: "پیگیری",
        cell: ({ row }) => (
          <div className="space-y-1 text-right text-xs">
            {followUpBadge(row.original.followUpState)}
            <p className="text-muted-foreground">
              {row.original.followUpAt
                ? formatJalaliDate(row.original.followUpAt)
                : "یادآوری ندارد"}
            </p>
          </div>
        ),
      },
      {
        header: "فعالیت",
        cell: ({ row }) => (
          <div className="text-right text-xs text-muted-foreground">
            <p>
              {toFa(row.original.callsCount)} تماس · {toFa(row.original.notesCount)} یادداشت
            </p>
            <p className="mt-0.5">
              {row.original.lastActivityAt
                ? `آخرین: ${formatJalaliDateTime(row.original.lastActivityAt)}`
                : "—"}
            </p>
          </div>
        ),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              title="کپی موبایل"
              onClick={async () => {
                await navigator.clipboard.writeText(row.original.phoneNumber);
                toast.success("شماره کپی شد");
              }}
            >
              <Copy className="size-4" />
            </Button>
            <Button asChild size="icon" variant="ghost" title="تماس">
              <a href={`tel:${row.original.phoneNumber}`}>
                <Phone className="size-4" />
              </a>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title={row.original.isStarred ? "برداشتن نشان" : "نشان‌کردن"}
              onClick={() =>
                toggleStar.mutate(row.original.id, {
                  onSuccess: () =>
                    toast.success(row.original.isStarred ? "از نشان‌شده‌ها حذف شد" : "نشان شد"),
                })
              }
            >
              <Star
                className={cn(
                  "size-4",
                  row.original.isStarred && "fill-orange text-orange",
                )}
              />
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.customer(row.original.id)}>پرونده</Link>
            </Button>
          </div>
        ),
      },
    ],
    [toggleStar],
  );

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="عملیات"
        title="مشتریان"
        description={
          selectedBootcamp
            ? `${toFa(rows.length)} مشتری در «${selectedBootcamp.title}»`
            : `${toFa(rows.length)} مشتری — پیگیری، یادداشت، تماس و مراحل ثبت‌نام.`
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`${routes.customers}?crm=followup`}>
              <Bell className="size-4" />
              صف پیگیری
            </Link>
          </Button>
        }
      />
      <div className="surface-panel p-5">
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">بوت‌کمپ</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              type="button"
              size="sm"
              variant={bootcampId === "all" ? "default" : "outline"}
              onClick={() => setBootcampId("all")}
            >
              همه
            </Button>
            {bootcamps.map((bootcamp) => (
              <Button
                key={bootcamp.id}
                type="button"
                size="sm"
                variant={bootcampId === bootcamp.id ? "default" : "outline"}
                onClick={() => setBootcampId(bootcamp.id)}
                className="shrink-0"
              >
                {bootcamp.title}
              </Button>
            ))}
          </div>
        </div>
        {listLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="نام، موبایل یا ایمیل…"
            toolbar={
              <div className="flex flex-wrap gap-2">
                <Select
                  value={crmFilter}
                  onValueChange={(value) =>
                    setCrmFilter(value as NonNullable<ListParams["crmFilter"]>)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فیلتر CRM" />
                  </SelectTrigger>
                  <SelectContent>
                    {crmFilters.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
