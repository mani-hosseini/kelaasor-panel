"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import { useMarkInstallmentPaid, usePayment, useVerifyPayment } from "@/lib/api/queries";
import { formatJalaliDate, formatToman } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = usePayment(id);
  const verify = useVerifyPayment();
  const markPaid = useMarkInstallmentPaid();

  if (isLoading || !data) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={routes.payments}
        eyebrow="پرداخت"
        title={userName(data.userId)}
        description={bootcampTitle(data.bootcampId)}
        actions={
          <Badge variant={data.verified ? "success" : "warning"}>{data.paymentStatus}</Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>خلاصه مالی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <Stat label="مبلغ کل" value={formatToman(data.totalAmount)} />
              <Stat label="وصول‌شده" value={formatToman(data.paidAmount)} />
              <Stat label="نوع" value={data.paymentType === 2 ? "اقساطی" : "نقدی"} />
            </div>
            <Progress value={data.paidPercentage} />
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
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
            <Button
              className="w-full"
              disabled={verify.isPending || data.verified}
              onClick={() =>
                verify.mutate(
                  { id, approved: true },
                  { onSuccess: () => toast.success("پرداخت تأیید شد") },
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
                  { onSuccess: () => toast.message("فیش رد شد") },
                )
              }
            >
              رد فیش
            </Button>
          </CardContent>
        </Card>
      </div>

      {data.installments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>اقساط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.installments.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-semibold">قسط {item.installmentNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    سررسید {formatJalaliDate(item.dueDate)} — {formatToman(item.amount)}
                  </p>
                </div>
                {item.isPaid ? (
                  <Badge variant="success">پرداخت شده</Badge>
                ) : (
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
                    علامت‌گذاری پرداخت
                  </Button>
                )}
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

function FileBox({ title, value, extra }: { title: string; value: string | null; extra?: string | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm font-medium" dir="ltr">
        {value ?? "آپلود نشده"}
      </p>
      {extra ? <p className="mt-1 text-xs text-muted-foreground">شماره چک: {extra}</p> : null}
    </div>
  );
}
