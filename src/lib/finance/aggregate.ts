import { payableAmount } from "@/lib/api/paymentMoney";
import type { Bootcamp, Expense, ExpenseCategory, Payment, Topic } from "@/lib/api/types";
import { expenseCategoryMeta } from "@/lib/api/types";
import { formatJalaliSession } from "@/lib/format";

export type FinanceBucket = {
  key: string;
  label: string;
  revenue: number;
  collected: number;
  receivable: number;
  expense: number;
  net: number;
  count: number;
};

export type FinanceSnapshot = {
  collected: number;
  contracted: number;
  receivable: number;
  awaitingVerification: number;
  expenseTotal: number;
  net: number;
  installmentOutstanding: number;
  cashCollected: number;
  installmentCollected: number;
  byTopic: FinanceBucket[];
  bySeason: FinanceBucket[];
  byDelivery: FinanceBucket[];
  byBootcamp: FinanceBucket[];
  expenseByCategory: { key: ExpenseCategory; label: string; hint: string; amount: number }[];
  expenses: Expense[];
  payments: Payment[];
};

function isAwaiting(payment: Payment) {
  return (
    (!payment.verified && Boolean(payment.receipt)) ||
    payment.installments.some((item) => item.awaitingVerification)
  );
}

function emptyBucket(key: string, label: string): FinanceBucket {
  return {
    key,
    label,
    revenue: 0,
    collected: 0,
    receivable: 0,
    expense: 0,
    net: 0,
    count: 0,
  };
}

function finalize(buckets: Map<string, FinanceBucket>) {
  return [...buckets.values()]
    .map((item) => ({
      ...item,
      net: item.collected - item.expense,
    }))
    .sort((a, b) => b.collected + b.expense - (a.collected + a.expense));
}

export function buildFinanceSnapshot(input: {
  payments: Payment[];
  bootcamps: Bootcamp[];
  topics: Topic[];
  expenses: Expense[];
}): FinanceSnapshot {
  const { payments, bootcamps, topics, expenses } = input;
  const bootcampById = new Map(bootcamps.map((item) => [item.id, item]));
  const topicById = new Map(topics.map((item) => [item.id, item]));

  let collected = 0;
  let contracted = 0;
  let awaitingVerification = 0;
  let installmentOutstanding = 0;
  let cashCollected = 0;
  let installmentCollected = 0;

  const byTopic = new Map<string, FinanceBucket>();
  const bySeason = new Map<string, FinanceBucket>();
  const byDelivery = new Map<string, FinanceBucket>();
  const byBootcamp = new Map<string, FinanceBucket>();

  for (const payment of payments) {
    const payable = payableAmount(payment);
    const paid = Math.min(payment.paidAmount, payable);
    const due = Math.max(0, payable - paid);
    collected += paid;
    contracted += payable;
    if (isAwaiting(payment)) awaitingVerification += paid;

    if (payment.paymentType === 1) cashCollected += paid;
    else {
      installmentCollected += paid;
      for (const inst of payment.installments) {
        if (!inst.isPaid) installmentOutstanding += inst.amount;
      }
      if (payment.installments.length === 0) installmentOutstanding += due;
    }

    const bootcamp = bootcampById.get(payment.bootcampId);
    const topicTitle = bootcamp
      ? (topicById.get(bootcamp.topicId)?.title ?? "بدون موضوع")
      : "بدون بوت‌کمپ";
    const topicKey = String(bootcamp?.topicId ?? "none");
    const season =
      formatJalaliSession(bootcamp?.currentEvent?.startDate) ?? "بدون فصل / آنلاین جاری";
    const bootcampLabel = bootcamp?.title ?? `بوت‌کمپ #${payment.bootcampId}`;
    const bootcampKey = String(payment.bootcampId);

    const touch = (map: Map<string, FinanceBucket>, key: string, label: string) => {
      const bucket = map.get(key) ?? emptyBucket(key, label);
      bucket.revenue += payable;
      bucket.collected += paid;
      bucket.receivable += due;
      bucket.count += 1;
      map.set(key, bucket);
    };

    touch(byTopic, topicKey, topicTitle);
    touch(bySeason, season, season);
    touch(byBootcamp, bootcampKey, bootcampLabel);
    // Payments themselves aren't tagged online/in-person; attribute via expense later + season heuristic
    const deliveryKey = season.includes("بدون فصل") ? "online" : "in_person";
    const deliveryLabel = deliveryKey === "online" ? "آنلاین" : "حضوری فصلی";
    touch(byDelivery, deliveryKey, deliveryLabel);
  }

  const expenseByCategoryMap = new Map<ExpenseCategory, number>();
  let expenseTotal = 0;

  for (const expense of expenses) {
    expenseTotal += expense.amount;
    expenseByCategoryMap.set(
      expense.category,
      (expenseByCategoryMap.get(expense.category) ?? 0) + expense.amount,
    );

    const seasonKey = expense.season ?? "بدون فصل / آنلاین جاری";
    const seasonBucket = bySeason.get(seasonKey) ?? emptyBucket(seasonKey, seasonKey);
    seasonBucket.expense += expense.amount;
    bySeason.set(seasonKey, seasonBucket);

    if (expense.bootcampId != null) {
      const bootcamp = bootcampById.get(expense.bootcampId);
      const key = String(expense.bootcampId);
      const label = bootcamp?.title ?? `بوت‌کمپ #${expense.bootcampId}`;
      const bucket = byBootcamp.get(key) ?? emptyBucket(key, label);
      bucket.expense += expense.amount;
      byBootcamp.set(key, bucket);

      if (bootcamp) {
        const topicKey = String(bootcamp.topicId);
        const topicLabel = topicById.get(bootcamp.topicId)?.title ?? "بدون موضوع";
        const topicBucket = byTopic.get(topicKey) ?? emptyBucket(topicKey, topicLabel);
        topicBucket.expense += expense.amount;
        byTopic.set(topicKey, topicBucket);
      }
    }

    const deliveryKey = expense.delivery;
    const deliveryLabel =
      deliveryKey === "online"
        ? "آنلاین"
        : deliveryKey === "in_person"
          ? "حضوری فصلی"
          : "مشترک / ستادی";
    const deliveryBucket =
      byDelivery.get(deliveryKey) ?? emptyBucket(deliveryKey, deliveryLabel);
    deliveryBucket.expense += expense.amount;
    byDelivery.set(deliveryKey, deliveryBucket);
  }

  const receivable = Math.max(0, contracted - collected);

  return {
    collected,
    contracted,
    receivable,
    awaitingVerification,
    expenseTotal,
    net: collected - expenseTotal,
    installmentOutstanding: Math.max(0, installmentOutstanding),
    cashCollected,
    installmentCollected,
    byTopic: finalize(byTopic),
    bySeason: finalize(bySeason),
    byDelivery: finalize(byDelivery),
    byBootcamp: finalize(byBootcamp),
    expenseByCategory: (
      Object.keys(expenseCategoryMeta) as ExpenseCategory[]
    ).map((key) => ({
      key,
      label: expenseCategoryMeta[key].label,
      hint: expenseCategoryMeta[key].hint,
      amount: expenseByCategoryMap.get(key) ?? 0,
    })),
    expenses: [...expenses].sort((a, b) => b.spentAt.localeCompare(a.spentAt)),
    payments,
  };
}
