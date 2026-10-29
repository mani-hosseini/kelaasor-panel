import { EVENT_STATUS, type Bootcamp } from "@/lib/api/types";

export type BootcampLifecycle =
  | "pre"
  | "registering"
  | "ongoing"
  | "completed"
  | "none";

/**
 * Normalize panel (0–3) and Django (1–4) event statuses into one lifecycle key.
 * Prefers Persian/English statusDisplay when present to resolve ambiguous `1`/`2`.
 */
export function bootcampLifecycle(bootcamp: Bootcamp): BootcampLifecycle {
  const event = bootcamp.currentEvent;
  if (!event) return "none";

  const display = event.statusDisplay ?? "";
  if (/پایان|Completed/i.test(display)) return "completed";
  if (/برگزاری|Ongoing/i.test(display)) return "ongoing";
  if (/پیش.?ثبت|Pre-?register/i.test(display)) return "pre";
  if (/ثبت.?نام|Register/i.test(display)) return "registering";

  const status = event.status;
  // Django IntegerChoices: 1 pre … 4 completed
  if (status >= 1 && status <= 4) {
    return (["pre", "registering", "ongoing", "completed"] as const)[status - 1];
  }
  // Panel mock: 0 pre … 3 completed
  if (status >= 0 && status <= 3) {
    return (["pre", "registering", "ongoing", "completed"] as const)[status];
  }
  return "none";
}

export const lifecycleMeta: Record<
  Exclude<BootcampLifecycle, "none">,
  { label: string; badge: "default" | "secondary" | "success" | "warning" | "info" | "orange" }
> = {
  pre: { label: "پیش‌ثبت‌نام", badge: "info" },
  registering: { label: "در حال ثبت‌نام", badge: "success" },
  ongoing: { label: "در حال برگزاری", badge: "orange" },
  completed: { label: "پایان‌یافته", badge: "secondary" },
};

/** Sort: ongoing → registering → pre → completed → none, then by start date desc. */
export function compareBootcampsByLifecycle(a: Bootcamp, b: Bootcamp) {
  const order: BootcampLifecycle[] = [
    "ongoing",
    "registering",
    "pre",
    "completed",
    "none",
  ];
  const diff =
    order.indexOf(bootcampLifecycle(a)) - order.indexOf(bootcampLifecycle(b));
  if (diff !== 0) return diff;
  const aStart = a.currentEvent?.startDate ?? "";
  const bStart = b.currentEvent?.startDate ?? "";
  return bStart.localeCompare(aStart);
}

export function lifecycleFromEventStatus(status: number): BootcampLifecycle {
  if (status === EVENT_STATUS.PRE_REGISTERING) return "pre";
  if (status === EVENT_STATUS.REGISTERING) return "registering";
  if (status === EVENT_STATUS.ONGOING) return "ongoing";
  if (status === EVENT_STATUS.COMPLETED) return "completed";
  return "none";
}
