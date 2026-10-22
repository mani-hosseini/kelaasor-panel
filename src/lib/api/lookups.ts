"use client";

import { useMemo } from "react";

import { useBootcamps, useCustomers } from "@/lib/api/queries";

/**
 * Live name lookups for tables/detail pages.
 * Replaces deprecated mockStore-backed `userName` / `bootcampTitle`.
 */
export function useAdminLookups() {
  const bootcamps = useBootcamps();
  const customers = useCustomers();

  const bootcampTitles = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of bootcamps.data ?? []) {
      map.set(item.id, item.title);
    }
    return map;
  }, [bootcamps.data]);

  const userNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of customers.data ?? []) {
      const full = `${item.firstName} ${item.lastName}`.trim();
      map.set(item.id, full || item.phoneNumber || item.email || `کاربر #${item.id}`);
    }
    return map;
  }, [customers.data]);

  return {
    isLoading: bootcamps.isLoading || customers.isLoading,
    userName: (userId: number) => userNames.get(userId) ?? `کاربر #${userId}`,
    bootcampTitle: (bootcampId: number) =>
      bootcampTitles.get(bootcampId) ?? `بوت‌کمپ #${bootcampId}`,
  };
}
