"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Radio,
  Search,
} from "lucide-react";

import { BootcampEnrollmentCard } from "@/components/enrollments/BootcampEnrollmentCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBootcamps, useEnrollments } from "@/lib/api/queries";
import {
  ENROLLMENT_STATUS,
  EVENT_STATUS,
  type Enrollment,
} from "@/lib/api/types";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

type HubBucket = "registering" | "ongoing" | "completed";

const BUCKETS: {
  id: HubBucket;
  label: string;
  description: string;
  icon: typeof Radio;
  match: (status: number | null | undefined) => boolean;
}[] = [
  {
    id: "registering",
    label: "در حال ثبت‌نام",
    description: "بوت‌کمپ‌هایی که الان ثبت‌نام یا پیش‌ثبت‌نام باز دارند",
    icon: CalendarClock,
    match: (status) =>
      status === EVENT_STATUS.PRE_REGISTERING || status === EVENT_STATUS.REGISTERING,
  },
  {
    id: "ongoing",
    label: "در حال برگزاری",
    description: "دوره‌هایی که کلاس‌ها شروع شده و در جریان‌اند",
    icon: Radio,
    match: (status) => status === EVENT_STATUS.ONGOING,
  },
  {
    id: "completed",
    label: "برگزار شده",
    description: "بوت‌کمپ‌های پایان‌یافته برای آرشیو ثبت‌نام‌ها",
    icon: CheckCircle2,
    match: (status) => status === EVENT_STATUS.COMPLETED,
  },
];

function countForBootcamp(enrollments: Enrollment[], bootcampId: number) {
  const items = enrollments.filter((item) => item.bootcampId === bootcampId);
  const confirmedCount = items.filter(
    (item) => item.status === ENROLLMENT_STATUS.CONFIRMED,
  ).length;
  const pipelineCount = items.filter(
    (item) => item.status !== ENROLLMENT_STATUS.CONFIRMED,
  ).length;
  return { confirmedCount, pipelineCount, total: items.length };
}

export default function EnrollmentsPage() {
  const [bucket, setBucket] = useState<HubBucket>("registering");
  const [search, setSearch] = useState("");
  const bootcampsQuery = useBootcamps();
  const enrollmentsQuery = useEnrollments();

  const bootcamps = bootcampsQuery.data ?? [];
  const enrollments = enrollmentsQuery.data ?? [];
  const isLoading = bootcampsQuery.isLoading || enrollmentsQuery.isLoading;

  const countsByBucket = useMemo(() => {
    const map: Record<HubBucket, number> = {
      registering: 0,
      ongoing: 0,
      completed: 0,
    };
    for (const bootcamp of bootcamps) {
      const status = bootcamp.currentEvent?.status ?? null;
      for (const item of BUCKETS) {
        if (item.match(status)) map[item.id] += 1;
      }
    }
    return map;
  }, [bootcamps]);

  const visibleBootcamps = useMemo(() => {
    const active = BUCKETS.find((item) => item.id === bucket)!;
    const q = search.trim().toLowerCase();
    return bootcamps
      .filter((bootcamp) => active.match(bootcamp.currentEvent?.status ?? null))
      .filter((bootcamp) => {
        if (!q) return true;
        return (
          bootcamp.title.toLowerCase().includes(q) ||
          bootcamp.brief.toLowerCase().includes(q) ||
          bootcamp.slug.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.ordering - b.ordering || a.title.localeCompare(b.title, "fa"));
  }, [bootcamps, bucket, search]);

  const activeMeta = BUCKETS.find((item) => item.id === bucket)!;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="عملیات"
        title="ثبت‌نام بوت‌کمپ‌ها"
        description="اول بوت‌کمپ را از روی وضعیت رویداد انتخاب کنید؛ بعد تأیید نهایی‌ها و صف پیگیری را جدا ببینید."
      />

      <section className="grid gap-3 md:grid-cols-3">
        {BUCKETS.map((item) => {
          const Icon = item.icon;
          const active = bucket === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setBucket(item.id)}
              className={cn(
                "rounded-[1.75rem] border px-4 py-4 text-right transition",
                active
                  ? "border-brand/40 bg-brand text-white shadow-lift"
                  : "border-border bg-card hover:border-brand/25 hover:bg-brand/[0.03]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-2xl",
                    active ? "bg-white/15" : "bg-brand/10 text-brand",
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                    active ? "bg-white/15" : "bg-muted text-foreground",
                  )}
                >
                  {toFa(countsByBucket[item.id])}
                </span>
              </div>
              <p className="mt-4 text-base font-bold">{item.label}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  active ? "text-white/75" : "text-muted-foreground",
                )}
              >
                {item.description}
              </p>
            </button>
          );
        })}
      </section>

      <section className="surface-panel space-y-5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold">{activeMeta.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {toFa(visibleBootcamps.length)} بوت‌کمپ در این بخش
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی بوت‌کمپ…"
              className="ps-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-3xl" />
            ))}
          </div>
        ) : visibleBootcamps.length === 0 ? (
          <EmptyBootcamps bucketLabel={activeMeta.label} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleBootcamps.map((bootcamp) => {
              const counts = countForBootcamp(enrollments, bootcamp.id);
              return (
                <BootcampEnrollmentCard
                  key={bootcamp.id}
                  bootcamp={bootcamp}
                  confirmedCount={counts.confirmedCount}
                  pipelineCount={counts.pipelineCount}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyBootcamps({ bucketLabel }: { bucketLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-brand">
        <GraduationCap className="size-6" />
      </div>
      <p className="font-semibold">بوت‌کمپی در «{bucketLabel}» نیست</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        وقتی وضعیت رویداد بوت‌کمپ به این مرحله برسد، اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
}
