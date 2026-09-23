"use client";

import Link from "next/link";
import {
  Banknote,
  ClipboardList,
  GraduationCap,
  PhoneCall,
  Users,
  Wallet,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

import { WeeklyEnrollmentsChart } from "@/components/charts/WeeklyEnrollmentsChart";
import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bootcampTitle, userName } from "@/lib/api/client";
import { useDashboard } from "@/lib/api/queries";
import { formatJalaliDateTime, formatPercent, formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    );
  }

  const kpis = [
    { label: "مشتریان", value: toFa(data.totalUsers), icon: Users, hint: "دانشجوی ثبت‌شده در سایت" },
    { label: "بوت‌کمپ فعال", value: toFa(data.activeBootcamps), icon: GraduationCap, hint: "دارای ثبت‌نام جاری" },
    { label: "صف ادمین", value: toFa(data.pendingAdminActions), icon: ClipboardList, hint: "گام بعدی با شماست" },
    { label: "منتظر تماس", value: toFa(data.awaitingCounselorCall), icon: PhoneCall, hint: "پیش‌ثبت‌نام و پیگیری" },
    { label: "تأیید فیش", value: toFa(data.awaitingPaymentVerification), icon: AlertTriangle, hint: "منتظر بررسی رسید" },
    { label: "وصول‌شده", value: formatToman(data.collectedRevenue), icon: Wallet, hint: "مبالغ تأییدشده" },
  ];

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="میزکار"
        title="پیشخوان عملیات کلاسور"
        description="نمای CRM از مشتریان، قیف ثبت‌نام بوت‌کمپ و کارهای امروز ادمین."
        actions={
          <div className="flex flex-wrap justify-start gap-2">
            <Button asChild variant="outline">
              <Link href={routes.customers}>مشتریان</Link>
            </Button>
            <Button asChild>
              <Link href={routes.enrollments}>صف ثبت‌نام‌ها</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-xl font-bold">{item.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{item.hint}</p>
                </div>
                <span className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between bg-brand px-5 py-3 text-white">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-4" />
              <p className="text-sm font-semibold">عملیات سریع</p>
            </div>
            <Badge className="bg-white/15 text-white hover:bg-white/20">کلاسور</Badge>
          </div>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3 xl:grid-cols-1">
            {data.quickLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-brand/40 hover:bg-brand/5"
              >
                <div>
                  <p className="text-sm font-semibold">{link.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{link.description}</p>
                  <p className="mt-2 text-xs font-medium text-brand">{toFa(link.count)} مورد</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                  مشاهده
                  <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>مشتریان اولویت‌دار و آمار مالی</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="priority">
              <TabsList>
                <TabsTrigger value="priority">مشتریان نیازمند پیگیری</TabsTrigger>
                <TabsTrigger value="finance">آمار پرداخت‌ها</TabsTrigger>
              </TabsList>
              <TabsContent value="priority" className="mt-4 space-y-2">
                {data.priorityCustomers.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    مشتری اولویت‌داری در صف نیست.
                  </p>
                ) : (
                  data.priorityCustomers.map((customer) => (
                    <Link
                      key={customer.id}
                      href={routes.customer(customer.id)}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-right transition hover:bg-brand-50/50"
                    >
                      <div className="min-w-0 text-right">
                        <p className="text-sm font-semibold">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.activeBootcampTitle ?? "بدون بوت‌کمپ"} ·{" "}
                          <span dir="ltr">{customer.phoneNumber}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {customer.activeEnrollmentStatus != null ? (
                          <EnrollmentStatusBadge status={customer.activeEnrollmentStatus} />
                        ) : null}
                        <Button size="sm" variant="outline" asChild>
                          <span>پرونده</span>
                        </Button>
                      </div>
                    </Link>
                  ))
                )}
              </TabsContent>
              <TabsContent value="finance" className="mt-4 grid gap-3 sm:grid-cols-3">
                <FinanceStat label="وصول‌شده" value={formatToman(data.collectedRevenue)} />
                <FinanceStat label="مانده قرارداد" value={formatToman(data.unpaidAmount)} />
                <FinanceStat label="ارزش کل ثبت‌نام‌ها" value={formatToman(data.estimatedRevenue)} />
                <div className="sm:col-span-3 rounded-2xl border border-border px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>نسبت وصول به قرارداد</span>
                    <span className="font-semibold">
                      {formatPercent(
                        data.estimatedRevenue
                          ? Math.round((data.collectedRevenue / data.estimatedRevenue) * 100)
                          : 0,
                      )}
                    </span>
                  </div>
                  <Progress
                    value={
                      data.estimatedRevenue
                        ? Math.round((data.collectedRevenue / data.estimatedRevenue) * 100)
                        : 0
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <WeeklyEnrollmentsChart data={data.weeklyEnrollments} />
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>قیف ثبت‌نام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.funnel.map((step) => {
              const max = Math.max(...data.funnel.map((item) => item.count), 1);
              return (
                <div key={step.status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>{step.label}</span>
                    <span className="font-semibold">{toFa(step.count)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(step.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>کارهای امروز من</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>پیشرفت صف عملیات</span>
                <span className="font-semibold">{formatPercent(data.adminQueueProgress)}</span>
              </div>
              <Progress value={data.adminQueueProgress} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {toFa(data.pendingAdminActions)} مورد باز در صف ادمین
              </p>
            </div>
            <div className="space-y-2">
              {data.todayTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="mx-auto mb-2 size-5 text-brand" />
                  کار باز برای امروز نیست.
                </div>
              ) : (
                data.todayTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={task.href}
                    className="block rounded-2xl border border-border px-3 py-2.5 transition hover:bg-brand/5"
                  >
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">{task.meta}</p>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>آخرین تماس‌ها</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.customers}>مشتریان</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentCalls.map((call) => (
              <Link
                key={call.id}
                href={routes.customer(call.userId)}
                className="block rounded-2xl border border-border px-3 py-2.5 transition hover:bg-brand/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{userName(call.userId)}</p>
                  <Badge variant="secondary">{call.outcomeLabel}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{call.summary}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatJalaliDateTime(call.calledAt)}
                </p>
              </Link>
            ))}
            {data.recentCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground">تماسی ثبت نشده.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>آخرین ثبت‌نام‌ها</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.enrollments}>همه</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentEnrollments.map((item) => (
              <Link
                key={item.id}
                href={routes.customer(item.userId)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-2.5 transition hover:bg-brand-50/50"
              >
                <div>
                  <p className="text-sm font-semibold">{userName(item.userId)}</p>
                  <p className="text-xs text-muted-foreground">{bootcampTitle(item.bootcampId)}</p>
                </div>
                <EnrollmentStatusBadge status={item.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Banknote className="size-4 text-brand" />
            قرارداد کل این دوره: {formatToman(data.estimatedRevenue)}
          </span>
          <span>تأیید نهایی این ماه: {toFa(data.confirmedThisMonth)}</span>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}
