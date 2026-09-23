"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { toFa } from "@/lib/format";

const chartConfig = {
  count: {
    label: "پیش‌ثبت‌نام",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type WeeklyPoint = {
  week: string;
  count: number;
};

export function WeeklyEnrollmentsChart({ data }: { data: WeeklyPoint[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="xl:col-span-3">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>روند پیش‌ثبت‌نام هفتگی</CardTitle>
          <CardDescription>ثبت‌نام‌های ۸ هفته اخیر</CardDescription>
        </div>
        <BrandLogo size={40} className="shrink-0 rounded-lg" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        مجموع این بازه: {toFa(total)} پیش‌ثبت‌نام
      </CardFooter>
    </Card>
  );
}
