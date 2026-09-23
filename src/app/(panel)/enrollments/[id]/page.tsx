"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import { mockStore } from "@/lib/api/mock/store";
import { useEnrollment, useUpdateEnrollmentStatus } from "@/lib/api/queries";
import { ENROLLMENT_STATUS } from "@/lib/api/types";
import { formatJalaliDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

const actions = [
  { label: "تماس مشاور انجام شد", status: ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION },
  { label: "منتظر فیش", status: ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT },
  { label: "ارسال به تأیید پرداخت", status: ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION },
  { label: "تأیید نهایی", status: ENROLLMENT_STATUS.CONFIRMED },
  { label: "لغو ثبت‌نام", status: ENROLLMENT_STATUS.CANCELED },
];

export default function EnrollmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = useEnrollment(id);
  const updateStatus = useUpdateEnrollmentStatus();

  if (isLoading || !data) {
    return <Skeleton className="h-96" />;
  }

  const user = mockStore.getUser(data.userId);
  const payment = data.paymentId ? mockStore.getPayment(data.paymentId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={routes.enrollments}
        eyebrow="ثبت‌نام"
        title={userName(data.userId)}
        description={bootcampTitle(data.bootcampId)}
        actions={<EnrollmentStatusBadge status={data.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>پروفایل دانشجو</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            <Field label="موبایل" value={user?.phoneNumber} ltr />
            <Field label="ایمیل" value={user?.email} ltr />
            <Field label="کد ملی" value={user?.profile.nationalId} ltr />
            <Field label="تحصیلات" value={user?.profile.educationLevelDisplay} />
            <Field label="رشته" value={user?.profile.fieldOfStudy} />
            <Field label="لینکدین" value={user?.profile.linkedinUrl ?? "—"} />
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">تجربه قبلی</p>
              <p className="mt-1">{user?.profile.experienceDescription ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اقدام ادمین</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              ثبت‌شده در {formatJalaliDateTime(data.enrolledAt)} — گام بعدی: {data.nextStepByDisplay}
            </p>
            {data.notes ? (
              <p className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">{data.notes}</p>
            ) : null}
            {actions.map((action) => (
              <Button
                key={action.status}
                variant={action.status === ENROLLMENT_STATUS.CANCELED ? "destructive" : "outline"}
                className="w-full justify-start"
                disabled={updateStatus.isPending || data.status === action.status}
                onClick={() => {
                  updateStatus.mutate(
                    { id, status: action.status },
                    {
                      onSuccess: () => toast.success("وضعیت به‌روز شد"),
                      onError: (error) => toast.error(error.message),
                    },
                  );
                }}
              >
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>پرداخت مرتبط</CardTitle>
        </CardHeader>
        <CardContent>
          {payment ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{payment.paymentStatus}</p>
                <p className="text-sm text-muted-foreground">
                  {payment.paymentType === 2 ? "اقساطی" : "نقدی"} — رسید: {payment.receipt ? "دارد" : "ندارد"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={payment.verified ? "success" : "warning"}>
                  {payment.verified ? "تأییدشده" : "در انتظار"}
                </Badge>
                <Button asChild size="sm">
                  <Link href={routes.payment(payment.id)}>مشاهده پرداخت</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">هنوز پرداختی ثبت نشده است.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, ltr }: { label: string; value?: string | null; ltr?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium" dir={ltr ? "ltr" : undefined}>
        {value || "—"}
      </p>
    </div>
  );
}
