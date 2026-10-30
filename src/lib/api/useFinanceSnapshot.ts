"use client";

import { useMemo } from "react";

import { useBootcamps, useExpenses, usePayments, useTopics } from "@/lib/api/queries";
import { buildFinanceSnapshot } from "@/lib/finance/aggregate";

export function useFinanceSnapshot() {
  const paymentsQuery = usePayments();
  const bootcampsQuery = useBootcamps();
  const topicsQuery = useTopics();
  const expensesQuery = useExpenses();

  const snapshot = useMemo(() => {
    if (!paymentsQuery.data || !bootcampsQuery.data || !topicsQuery.data || !expensesQuery.data) {
      return null;
    }
    return buildFinanceSnapshot({
      payments: paymentsQuery.data,
      bootcamps: bootcampsQuery.data,
      topics: topicsQuery.data,
      expenses: expensesQuery.data,
    });
  }, [paymentsQuery.data, bootcampsQuery.data, topicsQuery.data, expensesQuery.data]);

  return {
    snapshot,
    isLoading:
      paymentsQuery.isLoading ||
      bootcampsQuery.isLoading ||
      topicsQuery.isLoading ||
      expensesQuery.isLoading,
    isError:
      paymentsQuery.isError ||
      bootcampsQuery.isError ||
      topicsQuery.isError ||
      expensesQuery.isError,
  };
}
