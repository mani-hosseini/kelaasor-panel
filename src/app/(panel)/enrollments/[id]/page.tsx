"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
import { StageActions } from "@/components/enrollments/StageActions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bootcampTitle, userName } from "@/lib/api/client";
import { mockStore } from "@/lib/api/mock/store";
import { useEnrollment } from "@/lib/api/queries";
import { formatJalaliDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function EnrollmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = useEnrollment(id);

  if (isLoading || !data) {
    return <Skeleton className="h-96" />;
  }

  const user = mockStore.getUser(data.userId);
  const payment = data.paymentId ? mockStore.getPayment(data.paymentId) : null;
  const certificate = mockStore
    .listCertificates()
    .find((item) => item.enrollmentId === data.id && !item.revoked);

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        backHref={routes.enrollments}
        eyebrow="ثبت‌نام"
        title={userName(data.userId)}
        description={bootcampTitle(data.bootcampId)}
        actions={
          <div className="flex gap-2">
            <EnrollmentStatusBadge status={data.status} />
            <Button asChild size="sm" variant="outline">
              <Link href={routes.customer(data.userId)}>پرونده مشتری</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>پروفایل دانشجو</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
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
            <CardTitle>اقدام ادمین (هم‌راستا با مراحل سایت)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              ثبت‌شده در {formatJalaliDateTime(data.enrolledAt)} — گام بعدی: {data.nextStepByDisplay}
            </p>
            {data.notes ? (
              <p className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">{data.notes}</p>
            ) : null}
            <StageActions enrollmentId={id} currentStatus={data.status} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
                    {payment.paymentType === 2 ? "اقساطی" : "نقدی"} — رسید:{" "}
                    {payment.receipt ? "دارد" : "ندارد"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={payment.verified ? "success" : "warning"}>
                    {payment.verified ? "تأییدشده" : "در انتظار"}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href={routes.payment(payment.id)}>بررسی فیش</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">هنوز پرداختی ثبت نشده است.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>گواهی</CardTitle>
          </CardHeader>
          <CardContent>
            {certificate ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{certificate.title}</p>
                  <p className="text-xs text-muted-foreground">
                    صادرشده {formatJalaliDateTime(certificate.issuedAt)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={routes.certificates}>مدیریت گواهی‌ها</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                پس از تأیید نهایی، گواهی به‌صورت خودکار در صف صدور قرار می‌گیرد.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
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
