"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ExpenseFormDialog } from "@/components/finance/ExpenseFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteExpense } from "@/lib/api/queries";
import type { Expense } from "@/lib/api/types";
import { expenseCategoryMeta } from "@/lib/api/types";
import type { FinanceBucket, FinanceSnapshot } from "@/lib/finance/aggregate";
import { formatJalaliDate, formatToman, formatTomanCompact, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function FinanceKpiGrid({ snapshot }: { snapshot: FinanceSnapshot }) {
  const items = [
    {
      label: "وصول‌شده",
      value: formatTomanCompact(snapshot.collected),
      full: formatToman(snapshot.collected),
      tone: "brand" as const,
    },
    {
      label: "هزینه",
      value: formatTomanCompact(snapshot.expenseTotal),
      full: formatToman(snapshot.expenseTotal),
      tone: "orange" as const,
    },
    {
      label: "سود عملیاتی",
      value: formatTomanCompact(snapshot.net),
      full: formatToman(snapshot.net),
      tone: snapshot.net >= 0 ? ("success" as const) : ("danger" as const),
    },
    {
      label: "مانده وصول",
      value: formatTomanCompact(snapshot.receivable),
      full: formatToman(snapshot.receivable),
      tone: "muted" as const,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          title={item.full}
          className={cn(
            "rounded-2xl border px-4 py-3.5",
            item.tone === "brand" && "border-brand/25 bg-brand/[0.06]",
            item.tone === "orange" && "border-orange/25 bg-orange/[0.07]",
            item.tone === "success" && "border-emerald-200 bg-emerald-50/80",
            item.tone === "danger" && "border-rose-200 bg-rose-50/80",
            item.tone === "muted" && "border-border bg-card",
          )}
        >
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1.5 text-xl font-bold tabular-nums tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function FinanceSecondaryStats({ snapshot }: { snapshot: FinanceSnapshot }) {
  const chips = [
    { label: "قراردادها", value: formatTomanCompact(snapshot.contracted) },
    { label: "نقد", value: formatTomanCompact(snapshot.cashCollected) },
    { label: "اقساط وصول", value: formatTomanCompact(snapshot.installmentCollected) },
    { label: "اقساط مانده", value: formatTomanCompact(snapshot.installmentOutstanding) },
    { label: "صف تأیید", value: formatTomanCompact(snapshot.awaitingVerification) },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-center"
        >
          <p className="text-[10px] text-muted-foreground">{chip.label}</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{chip.value}</p>
        </div>
      ))}
    </div>
  );
}

export function FinanceBucketList({
  title,
  description,
  buckets,
  empty,
  linkBootcamp,
}: {
  title: string;
  description?: string;
  buckets: FinanceBucket[];
  empty: string;
  linkBootcamp?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        {buckets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {empty}
          </p>
        ) : (
          buckets.map((bucket) => (
            <div
              key={bucket.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 px-3.5 py-3"
            >
              <div className="min-w-0 text-right">
                {linkBootcamp && /^\d+$/.test(bucket.key) ? (
                  <Link
                    href={routes.paymentsByBootcamp(bucket.key)}
                    className="font-semibold hover:text-brand"
                  >
                    {bucket.label}
                  </Link>
                ) : (
                  <p className="font-semibold">{bucket.label}</p>
                )}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {bucket.count > 0 ? `${toFa(bucket.count)} پرداخت · ` : ""}
                  هزینه {formatTomanCompact(bucket.expense)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Badge variant="success">وصول {formatTomanCompact(bucket.collected)}</Badge>
                {bucket.receivable > 0 ? (
                  <Badge variant="secondary">مانده {formatTomanCompact(bucket.receivable)}</Badge>
                ) : null}
                <Badge variant={bucket.net >= 0 ? "default" : "danger"}>
                  خالص {formatTomanCompact(bucket.net)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function FinanceExpenseCategories({ snapshot }: { snapshot: FinanceSnapshot }) {
  const max = Math.max(...snapshot.expenseByCategory.map((item) => item.amount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>دسته‌های هزینه</CardTitle>
        <CardDescription>از حق‌التدریس تا فضای حضوری فصلی</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {snapshot.expenseByCategory.map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.hint}</p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">
                {formatTomanCompact(item.amount)}
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.round((item.amount / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function FinanceExpenseLedger({ expenses }: { expenses: Expense[] }) {
  const deleteExpense = useDeleteExpense();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1.5 text-right">
            <CardTitle>دفتر هزینه</CardTitle>
            <CardDescription>{toFa(expenses.length)} ردیف ثبت‌شده</CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            ثبت هزینه
          </Button>
        </CardHeader>
        <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              هنوز هزینه‌ای ثبت نشده. با «ثبت هزینه» شروع کنید.
            </p>
          ) : (
            expenses.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border px-3.5 py-3"
              >
                <div className="min-w-0 text-right">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {expenseCategoryMeta[item.category].label}
                    {item.season ? ` · ${item.season}` : ""}
                    {" · "}
                    {item.delivery === "online"
                      ? "آنلاین"
                      : item.delivery === "in_person"
                        ? "حضوری"
                        : "مشترک"}
                    {" · "}
                    {formatJalaliDate(item.spentAt)}
                  </p>
                  {item.note ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.note}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="text-sm font-bold tabular-nums text-orange">
                    {formatTomanCompact(item.amount)}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    aria-label="ویرایش"
                    onClick={() => setEditing(item)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    aria-label="حذف"
                    disabled={deleteExpense.isPending}
                    onClick={() => {
                      if (!window.confirm(`«${item.title}» حذف شود؟`)) return;
                      deleteExpense.mutate(item.id, {
                        onSuccess: () => toast.success("هزینه حذف شد"),
                        onError: (error) => toast.error(error.message),
                      });
                    }}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ExpenseFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        expense={editing}
      />
    </>
  );
}
