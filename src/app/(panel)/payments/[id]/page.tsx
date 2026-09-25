"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import {
  useMarkInstallmentPaid,
  usePayment,
  useRejectInstallment,
  useVerifyPayment,
} from "@/lib/api/queries";
import { formatJalaliDate, formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = usePayment(id);
  const verify = useVerifyPayment();
  const markPaid = useMarkInstallmentPaid();
  const rejectInstallment = useRejectInstallment();

  if (isLoading || !data) return <Skeleton className="h-96" />;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        backHref={routes.payments}
        eyebrow="پرداخت"
        title={userName(data.userId)}
        description={bootcampTitle(data.bootcampId)}
        actions={
          <div className="flex gap-2">
            <Badge variant={data.verified ? "success" : "warning"}>{data.paymentStatus}</Badge>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.customer(data.userId)}>پرونده مشتری</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>خلاصه مالی و مدارک</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <Stat label="مبلغ کل" value={formatToman(data.totalAmount)} />
              <Stat label="وصول‌شده" value={formatToman(data.paidAmount)} />
              <Stat label="نوع" value={data.paymentType === 2 ? "اقساطی" : "نقدی"} />
            </div>
            <Progress value={data.paidPercentage} />
            <div className="grid gap-3 sm:grid-cols-2">
              <FileBox title="فیش پرداخت" value={data.receipt} />
              <FileBox title="تصویر چک" value={data.cheque} extra={data.chequeNumber} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>تأیید ادمین</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              با تأیید، ثبت‌نام به وضعیت نهایی می‌رود و گواهی به‌صورت خودکار صادر می‌شود.
            </p>
            <Button
              className="w-full"
              disabled={verify.isPending || data.verified}
              onClick={() =>
                verify.mutate(
                  { id, approved: true },
                  { onSuccess: () => toast.success("پرداخت تأیید و گواهی صادر شد") },
                )
              }
            >
              تأیید فیش و ثبت‌نام
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              disabled={verify.isPending}
              onClick={() =>
                verify.mutate(
                  { id, approved: false },
                  { onSuccess: () => toast.message("فیش رد شد؛ کاربر باید دوباره آپلود کند") },
                )
              }
            >
              رد فیش و پاک‌سازی رسید
            </Button>
          </CardContent>
        </Card>
      </div>

      {data.installments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>اقساط و رسید هر قسط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.installments.map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-2xl border border-border px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">قسط {toFa(item.installmentNumber)}</p>
                    <p className="text-xs text-muted-foreground">
                      سررسید {formatJalaliDate(item.dueDate)} — {formatToman(item.amount)}
                    </p>
                  </div>
                  {item.isPaid ? (
                    <Badge variant="success">پرداخت شده</Badge>
                  ) : item.awaitingVerification ? (
                    <Badge variant="warning">منتظر تأیید رسید</Badge>
                  ) : (
                    <Badge variant="secondary">بدون رسید</Badge>
                  )}
                </div>
                <FileBox title="رسید قسط" value={item.paymentReceipt} />
                {!item.isPaid ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={markPaid.isPending || !item.paymentReceipt}
                      onClick={() =>
                        markPaid.mutate(
                          { paymentId: id, installmentId: item.id },
                          { onSuccess: () => toast.success("قسط تأیید شد") },
                        )
                      }
                    >
                      تأیید رسید قسط
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={markPaid.isPending}
                      onClick={() =>
                        markPaid.mutate(
                          { paymentId: id, installmentId: item.id },
                          { onSuccess: () => toast.success("قسط ثبت شد") },
                        )
                      }
                    >
                      علامت‌گذاری پرداخت دستی
                    </Button>
                    {item.awaitingVerification ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={rejectInstallment.isPending}
                        onClick={() =>
                          rejectInstallment.mutate(
                            { paymentId: id, installmentId: item.id },
                            { onSuccess: () => toast.message("رسید قسط رد شد") },
                          )
                        }
                      >
                        رد رسید قسط
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function FileBox({
  title,
  value,
  extra,
}: {
  title: string;
  value: string | null;
  extra?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          dir="ltr"
        >
          {value}
          <ExternalLink className="size-3.5" />
        </a>
      ) : (
        <p className="mt-2 text-sm font-medium text-muted-foreground">آپلود نشده</p>
      )}
      {extra ? <p className="mt-1 text-xs text-muted-foreground">شماره چک: {extra}</p> : null}
      {value ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={title} className="max-h-48 w-full object-contain" />
        </div>
      ) : null}
    </div>
  );
}
