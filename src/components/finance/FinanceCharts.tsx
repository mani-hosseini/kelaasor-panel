"use client";

import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { FinanceSnapshot } from "@/lib/finance/aggregate";
import { formatToman, formatTomanCompact, toFa } from "@/lib/format";

const seasonConfig = {
  collected: { label: "وصول", color: "var(--chart-1)" },
  expense: { label: "هزینه", color: "var(--chart-2)" },
} satisfies ChartConfig;

const topicConfig = {
  collected: { label: "وصول", color: "var(--chart-1)" },
  receivable: { label: "مانده", color: "var(--chart-3)" },
} satisfies ChartConfig;

const expenseConfig = {
  instructor: { label: "حق‌التدریس", color: "var(--chart-1)" },
  venue: { label: "فضای حضوری", color: "var(--chart-2)" },
  marketing: { label: "جذب", color: "var(--chart-3)" },
  platform: { label: "زیرساخت", color: "var(--chart-4)" },
  operations: { label: "عملیات", color: "var(--chart-5)" },
  content: { label: "محتوا", color: "#9a4e0c" },
} satisfies ChartConfig;

type Props = { snapshot: FinanceSnapshot };

export function FinanceSeasonChart({ snapshot }: Props) {
  const data = snapshot.bySeason.slice(0, 6).map((item) => ({
    name: item.label.replace("بدون فصل / آنلاین جاری", "آنلاین"),
    collected: item.collected,
    expense: item.expense,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>وصول و هزینه فصلی</CardTitle>
        <CardDescription>حضوری‌ها فصل‌به‌فصل؛ آنلاین در ستون جدا</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart />
        ) : (
          <ChartContainer config={seasonConfig} className="aspect-auto h-72 w-full">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="collected" fill="var(--color-collected)" radius={8} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        خالص عملیاتی کل: {formatToman(snapshot.net)}
      </CardFooter>
    </Card>
  );
}

export function FinanceTopicChart({ snapshot }: Props) {
  const data = snapshot.byTopic.slice(0, 6).map((item) => ({
    name: item.label,
    collected: item.collected,
    receivable: item.receivable,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>وصول موضوعی</CardTitle>
        <CardDescription>فرانت‌اند، بک‌اند و بقیه مسیرها</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart />
        ) : (
          <ChartContainer config={topicConfig} className="aspect-auto h-72 w-full">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="collected" fill="var(--color-collected)" radius={8} stackId="a" />
              <Bar dataKey="receivable" fill="var(--color-receivable)" radius={8} stackId="a" />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function FinanceExpenseDonut({ snapshot }: Props) {
  const data = snapshot.expenseByCategory
    .filter((item) => item.amount > 0)
    .map((item) => ({
      category: item.key,
      label: item.label,
      amount: item.amount,
      fill: `var(--color-${item.key})`,
    }));

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ترکیب هزینه‌ها</CardTitle>
        <CardDescription>سهم هر دسته از هزینه کل</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {data.length === 0 ? (
          <EmptyChart />
        ) : (
          <ChartContainer config={expenseConfig} className="mx-auto aspect-square h-64 w-full max-w-xs">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="category" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                innerRadius={58}
                outerRadius={88}
                strokeWidth={3}
              >
                {data.map((item) => (
                  <Cell key={item.category} fill={item.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 6}
                            className="fill-foreground text-base font-bold"
                          >
                            {formatTomanCompact(total)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 14}
                            className="fill-muted-foreground text-[11px]"
                          >
                            هزینه کل
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="category" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        {toFa(data.length)} دسته فعال هزینه
      </CardFooter>
    </Card>
  );
}

function EmptyChart() {
  return (
    <p className="rounded-2xl border border-dashed border-border px-4 py-14 text-center text-sm text-muted-foreground">
      هنوز داده‌ای برای نمودار نیست.
    </p>
  );
}
