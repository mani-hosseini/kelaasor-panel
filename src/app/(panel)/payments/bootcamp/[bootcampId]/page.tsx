"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

import { BootcampBanner } from "@/components/bootcamps/BootcampBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { payableAmount } from "@/lib/api/paymentMoney";
import { useAdminLookups } from "@/lib/api/lookups";
import { useBootcamp, usePayments } from "@/lib/api/queries";
import type { Payment } from "@/lib/api/types";
import { formatPercent, formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

type ViewFilter = "all" | "awaiting" | "verified" | "installment";

export default function BootcampPaymentsPage() {
  const params = useParams<{ bootcampId: string }>();
  const bootcampId = Number(params.bootcampId);
  const bootcampQuery = useBootcamp(bootcampId);
  const paymentsQuery = usePayments(
    Number.isFinite(bootcampId) && bootcampId > 0 ? { bootcampId } : undefined,
  );
  const { userName } = useAdminLookups();

  const [filter, setFilter] = useState<ViewFilter>("all");
  const [search, setSearch] = useState("");

  const bootcamp = bootcampQuery.data;
  const allPayments = paymentsQuery.data ?? [];

  const filtered = useMemo(() => {
    let items = allPayments;
    if (filter === "awaiting") {
      items = items.filter(
        (item) =>
          (!item.verified && Boolean(item.receipt)) ||
          item.installments.some((row) => row.awaitingVerification),
      );
    } else if (filter === "verified") {
      items = items.filter((item) => item.verified);
    } else if (filter === "installment") {
      items = items.filter((item) => item.paymentType === 2);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter((item) => {
        const name = userName(item.userId).toLowerCase();
        return (
          name.includes(q) ||
          String(item.id).includes(q) ||
          item.paymentStatus.toLowerCase().includes(q)
        );
      });
    }
    return items;
  }, [allPayments, filter, search, userName]);

  if (bootcampQuery.isLoading || paymentsQuery.isLoading) {
    return <Skeleton className="h-96 rounded-[1.75rem]" />;
  }

  if (!bootcamp) {
    return (
      <div className="space-y-4">
        <PageHeader backHref={routes.payments} title="بوت‌کمپ پیدا نشد" />
        <Button asChild variant="outline">
          <Link href={routes.payments}>بازگشت</Link>
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
        <div className="relative h-40 bg-muted sm:h-48">
          <BootcampBanner
            banner={bootcamp.banner}
            alt={bootcamp.title}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <Button asChild size="sm" variant="secondary" className="mb-3 bg-white/90">
              <Link href={routes.payments}>
                <ArrowRight className="size-3.5" />
                همه بوت‌کمپ‌ها
              </Link>
            </Button>
            <p className="text-xs text-white/70">پرداخت‌های بوت‌کمپ</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{bootcamp.title}</h1>
            <p className="mt-1 text-sm text-white/80">
              {toFa(allPayments.length)} پرداخت · وصول{" "}
              {formatToman(allPayments.reduce((sum, item) => sum + item.paidAmount, 0))}
            </p>
          </div>
        </div>
      </div>

      <section className="surface-panel space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "همه"],
                ["awaiting", "منتظر تأیید"],
                ["verified", "تأییدشده"],
                ["installment", "اقساطی"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                size="sm"
                variant={filter === id ? "default" : "outline"}
                onClick={() => setFilter(id)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی دانشجو…"
              className="ps-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-14 text-center text-sm text-muted-foreground">
            پرداختی با این فیلتر نیست.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                name={userName(payment.userId)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PaymentRow({ payment, name }: { payment: Payment; name: string }) {
  const payable = payableAmount(payment);
  const discount = payment.couponDiscount ?? 0;
  const awaiting =
    (!payment.verified && Boolean(payment.receipt)) ||
    payment.installments.some((row) => row.awaitingVerification);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/80 px-4 py-3 transition hover:border-brand/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 text-right">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{name}</p>
          <Badge variant={payment.paymentType === 2 ? "info" : "secondary"}>
            {payment.paymentType === 2 ? "اقساط" : "نقدی"}
          </Badge>
          {awaiting ? <Badge variant="warning">نیاز به بررسی</Badge> : null}
          {discount > 0 ? <Badge variant="orange">کپن {formatToman(discount)}</Badge> : null}
        </div>
        <div className="mt-2 grid max-w-md gap-1 text-xs text-muted-foreground sm:grid-cols-3">
          <span>کل: {formatToman(payment.totalAmount)}</span>
          <span>قابل پرداخت: {formatToman(payable)}</span>
          <span>وصول: {formatToman(payment.paidAmount)}</span>
        </div>
        <div className="mt-2 w-full max-w-xs space-y-1">
          <Progress value={payment.paidPercentage} />
          <p className="text-[11px] text-muted-foreground">
            {formatPercent(payment.paidPercentage)} · {payment.paymentStatus}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={payment.verified ? "success" : "warning"}>
          {payment.verified ? "تأییدشده" : "در انتظار"}
        </Badge>
        <Button asChild size="sm" variant="outline">
          <Link href={routes.payment(payment.id)}>بررسی / کپن</Link>
        </Button>
      </div>
    </div>
  );
}
