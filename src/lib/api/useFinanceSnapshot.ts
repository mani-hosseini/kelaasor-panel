"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listExpenses } from "@/lib/api/expenseStore";
import { useBootcamps, usePayments, useTopics } from "@/lib/api/queries";
import { buildFinanceSnapshot } from "@/lib/finance/aggregate";

export function useFinanceSnapshot() {
  const paymentsQuery = usePayments();
  const bootcampsQuery = useBootcamps();
  const topicsQuery = useTopics();
  const expensesQuery = useQuery({
    queryKey: ["finance-expenses"],
    queryFn: () => listExpenses(),
    staleTime: 30_000,
  });

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
