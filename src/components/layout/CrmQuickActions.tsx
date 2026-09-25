"use client";

import Link from "next/link";
import { Bell, Star, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/api/queries";
import { toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

/** Compact CRM shortcuts for the top header (not a floating dock). */
export function CrmQuickActions({ className }: { className?: string }) {
  const { data } = useDashboard();
  const followUps = (data?.todayFollowUpsCount ?? 0) + (data?.overdueFollowUpsCount ?? 0);

  return (
    <div className={className}>
      <Button asChild size="sm" variant="outline" className="h-9 rounded-xl">
        <Link href={`${routes.customers}?crm=followup`}>
          <Bell className="size-3.5" />
          <span className="hidden sm:inline">یادآوری</span>
          {followUps > 0 ? (
            <span className="rounded-md bg-orange/15 px-1.5 text-[11px] font-semibold text-orange">
              {toFa(followUps)}
            </span>
          ) : null}
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="h-9 rounded-xl">
        <Link href={routes.customers}>
          <Users className="size-3.5" />
          <span className="hidden sm:inline">مشتریان</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="h-9 rounded-xl">
        <Link href={`${routes.customers}?crm=starred`}>
          <Star className="size-3.5" />
          <span className="hidden sm:inline">نشان‌شده‌ها</span>
        </Link>
      </Button>
    </div>
  );
}
