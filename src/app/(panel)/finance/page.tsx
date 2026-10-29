"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  FinanceBucketList,
  FinanceExpenseCategories,
  FinanceExpenseLedger,
  FinanceKpiGrid,
  FinanceSecondaryStats,
} from "@/components/finance/FinanceBuckets";
import {
  FinanceExpenseDonut,
  FinanceSeasonChart,
  FinanceTopicChart,
} from "@/components/finance/FinanceCharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceSnapshot } from "@/lib/api/useFinanceSnapshot";
import { routes } from "@/lib/routes";

export default function FinancePage() {
  const { snapshot, isLoading } = useFinanceSnapshot();

  return (
    <div dir="rtl" className="space-y-5 text-right">
      <PageHeader
        eyebrow="مالی کلاسور"
        title="بخش مالی"
        description="هر تب یک موضوع — از نمای کلی شروع کنید، جزئیات را جدا ببینید."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.payments}>
              صف پرداخت‌ها
              <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
        }
      />

      {isLoading || !snapshot ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-[1.75rem]" />
        </div>
      ) : (
        <>
          <FinanceKpiGrid snapshot={snapshot} />

          <Tabs defaultValue="overview" className="space-y-1">
            <TabsList className="sticky top-[4.25rem] z-20 bg-card/95 backdrop-blur">
              <TabsTrigger value="overview">نمای کلی</TabsTrigger>
              <TabsTrigger value="revenue">درآمد</TabsTrigger>
              <TabsTrigger value="expenses">هزینه‌ها</TabsTrigger>
              <TabsTrigger value="cohorts">فصل و بوت‌کمپ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                خلاصه وضعیت مالی کلاسور — جزئیات در تب‌های بعدی.
              </p>
              <FinanceSecondaryStats snapshot={snapshot} />
              <div className="grid gap-4 xl:grid-cols-5">
                <div className="xl:col-span-3">
                  <FinanceSeasonChart snapshot={snapshot} />
                </div>
                <div className="xl:col-span-2">
                  <FinanceExpenseDonut snapshot={snapshot} />
                </div>
              </div>
              <FinanceBucketList
                title="آنلاین در برابر حضوری"
                description="دو کانال اصلی برگزاری"
                buckets={snapshot.byDelivery}
                empty="تفکیک برگزاری خالی است."
              />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                وصول، مانده قرارداد و تفکیک موضوعی درآمد.
              </p>
              <FinanceTopicChart snapshot={snapshot} />
              <FinanceBucketList
                title="بر اساس موضوع"
                description="جمع همه ترم‌های هر مسیر آموزشی"
                buckets={snapshot.byTopic}
                empty="هنوز پرداختی ثبت نشده."
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                حق‌التدریس، فضای حضوری فصلی، جذب، LMS و عملیات.
              </p>
              <div className="grid gap-4 xl:grid-cols-5">
                <div className="xl:col-span-2">
                  <FinanceExpenseDonut snapshot={snapshot} />
                </div>
                <div className="xl:col-span-3">
                  <FinanceExpenseCategories snapshot={snapshot} />
                </div>
              </div>
              <FinanceExpenseLedger expenses={snapshot.expenses} />
            </TabsContent>

            <TabsContent value="cohorts" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                عملکرد چهارفصل حضوری و P&L هر بوت‌کمپ.
              </p>
              <div className="grid gap-4 xl:grid-cols-2">
                <FinanceBucketList
                  title="فصل‌ها"
                  description="بهار تا زمستان + آنلاین"
                  buckets={snapshot.bySeason}
                  empty="تفکیک فصلی خالی است."
                />
                <FinanceBucketList
                  title="بوت‌کمپ‌ها"
                  description="برای جزئیات پرداخت، روی عنوان بزنید"
                  buckets={snapshot.byBootcamp}
                  empty="پرداخت یا هزینه‌ای وصل نیست."
                  linkBootcamp
                />
              </div>
              <FinanceSeasonChart snapshot={snapshot} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
