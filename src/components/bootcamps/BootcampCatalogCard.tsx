"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { BootcampBanner } from "@/components/bootcamps/BootcampBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeleteBootcamp } from "@/lib/api/queries";
import type { Bootcamp } from "@/lib/api/types";
import {
  bootcampLifecycle,
  lifecycleMeta,
} from "@/lib/bootcampStatus";
import { formatJalaliDate, formatJalaliSession, formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  bootcamp: Bootcamp;
  className?: string;
};

export function BootcampCatalogCard({ bootcamp, className }: Props) {
  const remove = useDeleteBootcamp();
  const event = bootcamp.currentEvent;
  const life = bootcampLifecycle(bootcamp);
  const meta = life === "none" ? null : lifecycleMeta[life];
  const session = formatJalaliSession(event?.startDate);
  const confirmed = event?.confirmedEnrollmentsCount ?? 0;
  const capacity = event?.capacity || bootcamp.capacity;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lift",
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
          {session ? (
            <Badge className="bg-white/90 text-brand-800 backdrop-blur">{session}</Badge>
          ) : (
            <span />
          )}
          {meta ? (
            <Badge variant={meta.badge}>{meta.label}</Badge>
          ) : (
            <Badge variant="secondary">بدون رویداد</Badge>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <h3 className="line-clamp-2 text-base font-bold text-white drop-shadow">
            {bootcamp.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {bootcamp.brief}
        </p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {event?.startDate ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5 text-brand" />
              شروع {formatJalaliDate(event.startDate)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5 text-brand" />
            {toFa(confirmed)} / {toFa(capacity)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          <p className="text-sm font-bold tabular-nums text-brand">
            {formatToman(event?.finalPrice ?? null)}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 text-destructive hover:bg-danger-soft"
              aria-label="حذف بوت‌کمپ"
              onClick={() =>
                remove.mutate(bootcamp.id, {
                  onSuccess: () => toast.success("بوت‌کمپ حذف شد"),
                  onError: (error) =>
                    toast.error(error instanceof Error ? error.message : "حذف ممکن نشد"),
                })
              }
            >
              <Trash2 className="size-3.5" />
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1">
              <Link href={routes.bootcamp(bootcamp.id)}>
                جزئیات
                <ArrowLeft className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
