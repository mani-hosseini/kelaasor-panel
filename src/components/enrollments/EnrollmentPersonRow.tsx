"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Enrollment } from "@/lib/api/types";
import { formatJalaliDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  enrollment: Enrollment;
  userName: string;
  className?: string;
};

export function EnrollmentPersonRow({ enrollment, userName, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/80 px-3.5 py-3 transition hover:border-brand/30 hover:bg-brand/[0.03]",
        className,
      )}
    >
      <div className="min-w-0 text-right">
        <p className="truncate font-semibold">{userName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>#{enrollment.id}</span>
          <span className="opacity-40">·</span>
          <span>{formatJalaliDateTime(enrollment.enrolledAt)}</span>
          {enrollment.nextStepByDisplay ? (
            <>
              <span className="opacity-40">·</span>
              <Badge
                variant={enrollment.nextStepBy === 1 ? "orange" : "secondary"}
                className="h-5 px-1.5 text-[10px] font-normal"
              >
                {enrollment.nextStepByDisplay}
              </Badge>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <EnrollmentStatusBadge status={enrollment.status} />
        <Button asChild size="sm" variant="outline" className="gap-1">
          <Link href={routes.enrollment(enrollment.id)}>
            جزئیات
            <ChevronLeft className="size-3.5" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={routes.customer(enrollment.userId)}>پرونده</Link>
        </Button>
      </div>
    </div>
  );
}
