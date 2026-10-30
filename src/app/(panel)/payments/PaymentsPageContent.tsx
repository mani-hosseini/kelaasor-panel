"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  Radio,
  Search,
  Wallet,
} from "lucide-react";

import { BootcampEnrollmentCard } from "@/components/enrollments/BootcampEnrollmentCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { payableAmount } from "@/lib/api/paymentMoney";
import { useBootcamps, usePayments } from "@/lib/api/queries";
import { EVENT_STATUS, type ListParams, type Payment } from "@/lib/api/types";
import { formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type HubBucket = "registering" | "ongoing" | "completed" | "all";

const BUCKETS: {
  id: HubBucket;
  label: string;
  description: string;
  icon: typeof Radio;
  match: (status: number | null | undefined) => boolean;
}[] = [
  {
    id: "all",
    label: "همه بوت‌کمپ‌ها",
    description: "پرداخت‌های تمام دوره‌ها در یک نما",
    icon: Wallet,
    match: () => true,
  },
  {
    id: "registering",
    label: "در حال ثبت‌نام",
    description: "دوره‌هایی که هنوز ثبت‌نام باز است",
    icon: CalendarClock,
    match: (status) =>
      status === EVENT_STATUS.PRE_REGISTERING || status === EVENT_STATUS.REGISTERING,
  },
  {
    id: "ongoing",
    label: "در حال برگزاری",
    description: "وصول اقساط و فیش‌های دوره‌های جاری",
    icon: Radio,
    match: (status) => status === EVENT_STATUS.ONGOING,
  },
  {
    id: "completed",
    label: "برگزار شده",
    description: "آرشیو مالی دوره‌های تمام‌شده",
    icon: CheckCircle2,
    match: (status) => status === EVENT_STATUS.COMPLETED,
  },
];

const FILTERS: { id: NonNullable<ListParams["paymentFilter"]>; label: string }[] = [
  { id: "all", label: "همه پرداخت‌ها" },
  { id: "awaiting", label: "منتظر تأیید فیش" },
  { id: "installment", label: "اقساطی" },
];

function summarize(payments: Payment[]) {
  const awaiting = payments.filter(
    (item) =>
      (!item.verified && Boolean(item.receipt)) ||
      item.installments.some((row) => row.awaitingVerification),
  ).length;
  const collected = payments.reduce((sum, item) => sum + item.paidAmount, 0);
  const payable = payments.reduce((sum, item) => sum + payableAmount(item), 0);
  return { count: payments.length, awaiting, collected, payable };
}

export default function PaymentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const paymentFilter: ListParams["paymentFilter"] =
    filterParam === "awaiting" || filterParam === "installment" ? filterParam : "all";

  const [bucket, setBucket] = useState<HubBucket>("all");
  const [search, setSearch] = useState("");

  const bootcampsQuery = useBootcamps();
  const paymentsQuery = usePayments({ paymentFilter });

  const bootcamps = bootcampsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const isLoading = bootcampsQuery.isLoading || paymentsQuery.isLoading;

  const paymentsByBootcamp = useMemo(() => {
    const map = new Map<number, Payment[]>();
    for (const payment of payments) {
      const list = map.get(payment.bootcampId) ?? [];
      list.push(payment);
      map.set(payment.bootcampId, list);
    }
    return map;
  }, [payments]);

  const visibleBootcamps = useMemo(() => {
    const active = BUCKETS.find((item) => item.id === bucket)!;
    const q = search.trim().toLowerCase();
    return bootcamps
      .filter((bootcamp) => active.match(bootcamp.currentEvent?.status ?? null))
      .filter((bootcamp) => (paymentsByBootcamp.get(bootcamp.id)?.length ?? 0) > 0)
      .filter((bootcamp) => {
        if (!q) return true;
        return (
          bootcamp.title.toLowerCase().includes(q) ||
          bootcamp.brief.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.ordering - b.ordering || a.title.localeCompare(b.title, "fa"));
  }, [bootcamps, bucket, search, paymentsByBootcamp]);

  const totals = useMemo(() => summarize(payments), [payments]);

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="عملیات"
        title="پرداخت‌ها بر اساس بوت‌کمپ"
        description="اول دوره را انتخاب کنید؛ بعد فیش، اقساط و کپن هر نفر را مدیریت کنید."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Banknote className="size-4" />} label="پرداخت‌ها" value={toFa(totals.count)} />
        <Metric
          icon={<Wallet className="size-4" />}
          label="منتظر تأیید"
          value={toFa(totals.awaiting)}
          tone="warning"
        />
        <Metric
          icon={<CheckCircle2 className="size-4" />}
          label="مبلغ قابل پرداخت"
          value={formatToman(totals.payable)}
        />
        <Metric
          icon={<Radio className="size-4" />}
          label="وصول‌شده"
          value={formatToman(totals.collected)}
          tone="success"
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {BUCKETS.map((item) => {
          const Icon = item.icon;
          const active = bucket === item.id;
          const count = bootcamps.filter((bootcamp) => {
            if (!item.match(bootcamp.currentEvent?.status ?? null)) return false;
            return (paymentsByBootcamp.get(bootcamp.id)?.length ?? 0) > 0;
          }).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setBucket(item.id)}
              className={cn(
                "rounded-[1.75rem] border px-4 py-4 text-right transition",
                active
                  ? "border-brand/40 bg-brand text-white shadow-lift"
                  : "border-border bg-card hover:border-brand/25 hover:bg-brand/[0.03]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-2xl",
                    active ? "bg-white/15" : "bg-brand/10 text-brand",
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                    active ? "bg-white/15" : "bg-muted text-foreground",
                  )}
                >
                  {toFa(count)}
                </span>
              </div>
              <p className="mt-4 text-base font-bold">{item.label}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  active ? "text-white/75" : "text-muted-foreground",
                )}
              >
                {item.description}
              </p>
            </button>
          );
        })}
      </section>

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

      <section className="surface-panel space-y-5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold">بوت‌کمپ‌های دارای پرداخت</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {toFa(visibleBootcamps.length)} دوره در این نما
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی بوت‌کمپ…"
              className="ps-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-3xl" />
            ))}
          </div>
        ) : visibleBootcamps.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            پرداختی با این فیلتر پیدا نشد.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleBootcamps.map((bootcamp) => {
              const items = paymentsByBootcamp.get(bootcamp.id) ?? [];
              const awaiting = items.filter(
                (item) =>
                  (!item.verified && Boolean(item.receipt)) ||
                  item.installments.some((row) => row.awaitingVerification),
              ).length;
              const verified = items.filter((item) => item.verified).length;
              return (
                <BootcampEnrollmentCard
                  key={bootcamp.id}
                  bootcamp={bootcamp}
                  href={routes.paymentsByBootcamp(bootcamp.id)}
                  confirmedCount={verified}
                  pipelineCount={awaiting}
                  confirmedLabel="تأییدشده"
                  pipelineLabel="منتظر بررسی"
                  footerLabel="مدیریت پرداخت‌ها"
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-border bg-card px-4 py-3",
        tone === "success" && "border-emerald-200/80 bg-emerald-50/50",
        tone === "warning" && "border-amber-200/80 bg-amber-50/50",
      )}
    >
      <div className="mb-2 inline-flex size-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
