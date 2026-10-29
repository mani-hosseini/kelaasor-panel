"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAdminLookups } from "@/lib/api/lookups";
import {
  queryKeys,
  useCreateTask,
  useCustomers,
  useDeleteTask,
  useEnrollments,
  usePayments,
  useTasks,
  useUpdateTask,
} from "@/lib/api/queries";
import {
  dismissSystemTask,
  listDismissedSystemTasks,
  undismissSystemTask,
} from "@/lib/tasks/dismissStore";
import {
  deriveSystemTasks,
  toManualBoardItem,
  type TaskBoardItem,
  type TaskSource,
} from "@/lib/tasks/derive";

export type TaskBoardFilter = "open" | "system" | "manual" | "done";

export function useTaskBoard() {
  const queryClient = useQueryClient();
  const tasksQuery = useTasks();
  const customersQuery = useCustomers();
  const enrollmentsQuery = useEnrollments();
  const paymentsQuery = usePayments({ paymentFilter: "awaiting" });
  const { userName } = useAdminLookups();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [dismissedVersion, setDismissedVersion] = useState(0);

  const dismissedIds = useMemo(() => {
    void dismissedVersion;
    return new Set(listDismissedSystemTasks());
  }, [dismissedVersion]);

  const systemOpen = useMemo(() => {
    if (!customersQuery.data || !enrollmentsQuery.data || !paymentsQuery.data) {
      return [] as TaskBoardItem[];
    }
    return deriveSystemTasks({
      customers: customersQuery.data,
      enrollments: enrollmentsQuery.data,
      payments: paymentsQuery.data,
      userName,
      dismissedIds,
    });
  }, [
    customersQuery.data,
    enrollmentsQuery.data,
    paymentsQuery.data,
    userName,
    dismissedIds,
  ]);

  const manualItems = useMemo(
    () => (tasksQuery.data ?? []).map(toManualBoardItem),
    [tasksQuery.data],
  );

  const openManual = manualItems.filter((item) => !item.done);
  const doneManual = manualItems.filter((item) => item.done);

  const allOpen = useMemo(
    () => [...systemOpen, ...openManual].sort((a, b) => a.priority - b.priority),
    [systemOpen, openManual],
  );

  const counts = {
    open: allOpen.length,
    system: systemOpen.length,
    manual: openManual.length,
    done: doneManual.length,
  };

  function itemsFor(filter: TaskBoardFilter): TaskBoardItem[] {
    if (filter === "open") return allOpen;
    if (filter === "system") return systemOpen;
    if (filter === "manual") return openManual;
    return doneManual;
  }

  function dismiss(id: string) {
    dismissSystemTask(id);
    setDismissedVersion((value) => value + 1);
  }

  function restore(id: string) {
    undismissSystemTask(id);
    setDismissedVersion((value) => value + 1);
  }

  async function toggleManualDone(item: TaskBoardItem) {
    if (item.numericId == null) return;
    await updateTask.mutateAsync({
      id: item.numericId,
      data: { done: !item.done },
    });
  }

  async function removeManual(item: TaskBoardItem) {
    if (item.numericId == null) return;
    await deleteTask.mutateAsync(item.numericId);
  }

  async function addManual(input: {
    title: string;
    meta?: string;
    href?: string;
  }) {
    await createTask.mutateAsync({
      title: input.title.trim(),
      meta: input.meta?.trim() || "تسک دستی",
      href: input.href?.trim() || "/",
      done: false,
    });
  }

  return {
    isLoading:
      tasksQuery.isLoading ||
      customersQuery.isLoading ||
      enrollmentsQuery.isLoading ||
      paymentsQuery.isLoading,
    counts,
    itemsFor,
    sourceHint: (source: TaskSource) => source,
    dismiss,
    restore,
    toggleManualDone,
    removeManual,
    addManual,
    creating: createTask.isPending,
    updating: updateTask.isPending,
    refresh: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.enrollments() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments() });
    },
  };
}
