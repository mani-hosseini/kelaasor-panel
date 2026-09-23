import { Bell, ClipboardList, Phone, StickyNote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CustomerActivity } from "@/lib/api/types";
import { formatJalaliDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const kindMeta: Record<
  CustomerActivity["kind"],
  { label: string; icon: typeof Phone; className: string }
> = {
  note: { label: "یادداشت", icon: StickyNote, className: "bg-brand/10 text-brand" },
  call: { label: "تماس", icon: Phone, className: "bg-info-soft text-info" },
  enrollment: { label: "ثبت‌نام", icon: ClipboardList, className: "bg-orange/15 text-orange" },
  followup: { label: "پیگیری", icon: Bell, className: "bg-warning-soft text-warning" },
};

export function ActivityTimeline({
  items,
  empty = "هنوز فعالیتی ثبت نشده است.",
}: {
  items: CustomerActivity[];
  empty?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {empty}
      </p>
    );
  }

  return (
    <ol className="relative space-y-3 border-s border-border/80 ps-5">
      {items.map((item) => {
        const meta = kindMeta[item.kind];
        const Icon = meta.icon;
        return (
          <li key={item.id} className="relative">
            <span
              className={cn(
                "absolute top-1 -start-[1.6rem] grid size-7 place-items-center rounded-full",
                meta.className,
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="rounded-2xl border border-border bg-card px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{meta.label}</Badge>
                  <p className="text-sm font-semibold">{item.title}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {formatJalaliDateTime(item.at)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{item.body}</p>
              {item.meta ? (
                <p className="mt-1 text-[11px] text-muted-foreground">{item.meta}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
