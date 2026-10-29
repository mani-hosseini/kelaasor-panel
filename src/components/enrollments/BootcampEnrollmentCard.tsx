"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { BootcampBanner } from "@/components/bootcamps/BootcampBanner";
import { Badge } from "@/components/ui/badge";
import type { Bootcamp } from "@/lib/api/types";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  bootcamp: Bootcamp;
  confirmedCount: number;
  pipelineCount: number;
  href?: string;
  confirmedLabel?: string;
  pipelineLabel?: string;
  footerLabel?: string;
  className?: string;
};

export function BootcampEnrollmentCard({
  bootcamp,
  confirmedCount,
  pipelineCount,
  href,
  confirmedLabel = "تأیید نهایی",
  pipelineLabel = "در صف",
  footerLabel = "مدیریت ثبت‌نام‌ها",
  className,
}: Props) {
  const event = bootcamp.currentEvent;
  const total = confirmedCount + pipelineCount;

  return (
    <Link
      href={href ?? routes.enrollmentsByBootcamp(bootcamp.id)}
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-border bg-card text-right shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative h-36 overflow-hidden bg-muted">
        <BootcampBanner
          banner={bootcamp.banner}
          alt={bootcamp.title}
          className="absolute inset-0"
          imageClassName="transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="line-clamp-2 text-base font-bold text-white drop-shadow">
              {bootcamp.title}
            </p>
            {event?.statusDisplay ? (
              <p className="mt-1 text-[11px] text-white/80">{event.statusDisplay}</p>
            ) : null}
          </div>
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-brand group-hover:text-white">
            <ArrowLeft className="size-4" />
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {event?.startDate ? (
            <span>شروع {formatJalaliDate(event.startDate)}</span>
          ) : null}
          {event?.capacity ? (
            <>
              <span className="opacity-40">·</span>
              <span>ظرفیت {toFa(event.capacity)}</span>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatChip label="کل" value={total} />
          <StatChip label={confirmedLabel} value={confirmedCount} tone="success" />
          <StatChip label={pipelineLabel} value={pipelineCount} tone="warning" />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5 text-brand" />
            {footerLabel}
          </span>
          <Badge variant="secondary" className="font-normal">
            باز کردن
          </Badge>
        </div>
      </div>
    </Link>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-muted/40 px-2.5 py-2 text-center",
        tone === "success" && "border-emerald-200/80 bg-emerald-50/70",
        tone === "warning" && "border-amber-200/80 bg-amber-50/70",
      )}
    >
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{toFa(value)}</p>
    </div>
  );
}
