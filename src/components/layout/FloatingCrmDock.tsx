"use client";

import Link from "next/link";
import { Bell, StickyNote, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/api/queries";
import { toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export function FloatingCrmDock() {
  const { data } = useDashboard();
  const followUps = (data?.todayFollowUpsCount ?? 0) + (data?.overdueFollowUpsCount ?? 0);

  return (
    <div className="pointer-events-none fixed bottom-20 start-4 z-40 flex flex-col gap-2 lg:bottom-6">
      <Button
        asChild
        size="sm"
        className="pointer-events-auto h-11 rounded-2xl shadow-lift"
      >
        <Link href={`${routes.customers}?crm=followup`}>
          <Bell className="size-4" />
          یادآوری
          {followUps > 0 ? (
            <span className="ms-1 rounded-md bg-white/20 px-1.5 text-[11px]">{toFa(followUps)}</span>
          ) : null}
        </Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant="secondary"
        className="pointer-events-auto h-11 rounded-2xl shadow-soft"
      >
        <Link href={routes.customers}>
          <Users className="size-4" />
          مشتریان
        </Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="pointer-events-auto h-11 rounded-2xl border-brand/30 bg-card shadow-soft"
      >
        <Link href={`${routes.customers}?crm=starred`}>
          <StickyNote className="size-4" />
          نشان‌شده‌ها
        </Link>
      </Button>
    </div>
  );
}
