"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Filter,
  Search,
  Users,
} from "lucide-react";

import { BootcampBanner } from "@/components/bootcamps/BootcampBanner";
import { EnrollmentPersonRow } from "@/components/enrollments/EnrollmentPersonRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { enrollmentStatusMeta } from "@/lib/api/labels";
import { useAdminLookups } from "@/lib/api/lookups";
import { useBootcamp, useEnrollments } from "@/lib/api/queries";
import {
  ENROLLMENT_STATUS,
  type Enrollment,
  type EnrollmentStatus,
} from "@/lib/api/types";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const PIPELINE_FILTERS: { id: "all" | EnrollmentStatus; label: string }[] = [
  { id: "all", label: "همه غیرتأیید" },
  ...Object.entries(enrollmentStatusMeta)
    .filter(([value]) => Number(value) !== ENROLLMENT_STATUS.CONFIRMED)
    .map(([value, meta]) => ({
      id: Number(value) as EnrollmentStatus,
      label: meta.label,
    })),
];

export default function BootcampEnrollmentsPage() {
  const params = useParams<{ bootcampId: string }>();
  const bootcampId = Number(params.bootcampId);
  const bootcampQuery = useBootcamp(bootcampId);
  const enrollmentsQuery = useEnrollments({ bootcampId });
  const { userName } = useAdminLookups();

  const [pipelineFilter, setPipelineFilter] = useState<"all" | EnrollmentStatus>("all");
  const [confirmedSearch, setConfirmedSearch] = useState("");
  const [pipelineSearch, setPipelineSearch] = useState("");

  const bootcamp = bootcampQuery.data;
  const enrollments = enrollmentsQuery.data ?? [];

  const { confirmed, pipeline } = useMemo(() => {
    const forBootcamp = enrollments.filter((item) => item.bootcampId === bootcampId);
    return {
      confirmed: forBootcamp.filter(
        (item) => item.status === ENROLLMENT_STATUS.CONFIRMED,
      ),
      pipeline: forBootcamp.filter(
        (item) => item.status !== ENROLLMENT_STATUS.CONFIRMED,
      ),
    };
  }, [enrollments, bootcampId]);

  const filteredConfirmed = useMemo(() => {
    const q = confirmedSearch.trim().toLowerCase();
    if (!q) return confirmed;
    return confirmed.filter((item) => matchesSearch(item, userName(item.userId), q));
  }, [confirmed, confirmedSearch, userName]);

  const filteredPipeline = useMemo(() => {
    let items = pipeline;
    if (pipelineFilter !== "all") {
      items = items.filter((item) => item.status === pipelineFilter);
    }
    const q = pipelineSearch.trim().toLowerCase();
    if (q) {
      items = items.filter((item) => matchesSearch(item, userName(item.userId), q));
    }
    return items;
  }, [pipeline, pipelineFilter, pipelineSearch, userName]);

  const filterCounts = useMemo(() => {
    const map = new Map<"all" | EnrollmentStatus, number>();
    map.set("all", pipeline.length);
    for (const item of PIPELINE_FILTERS) {
      if (item.id === "all") continue;
      map.set(
        item.id,
        pipeline.filter((enrollment) => enrollment.status === item.id).length,
      );
    }
    return map;
  }, [pipeline]);

  if (bootcampQuery.isLoading || enrollmentsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-[1.75rem]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-[1.75rem]" />
          <Skeleton className="h-96 rounded-[1.75rem]" />
        </div>
      </div>
    );
  }

  if (!bootcamp) {
    return (
      <div className="space-y-4">
        <PageHeader
          backHref={routes.enrollments}
          title="بوت‌کمپ پیدا نشد"
          description="این بوت‌کمپ در داده‌های فعلی نیست."
        />
        <Button asChild variant="outline">
          <Link href={routes.enrollments}>بازگشت به ثبت‌نام‌ها</Link>
        </Button>
      </div>
    );
  }

  const event = bootcamp.currentEvent;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
        <div className="relative h-44 bg-muted sm:h-52">
          <BootcampBanner
            banner={bootcamp.banner}
            alt={bootcamp.title}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="mb-3 bg-white/90 hover:bg-white"
            >
              <Link href={routes.enrollments}>
                <ArrowRight className="size-3.5" />
                همه بوت‌کمپ‌ها
              </Link>
            </Button>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-white/70">ثبت‌نام‌های بوت‌کمپ</p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  {bootcamp.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  {event?.statusDisplay ? (
                    <Badge className="bg-white/15 text-white hover:bg-white/20">
                      {event.statusDisplay}
                    </Badge>
                  ) : null}
                  {event?.startDate ? (
                    <span>شروع {formatJalaliDate(event.startDate)}</span>
                  ) : null}
                  {event?.endDate ? (
                    <span>پایان {formatJalaliDate(event.endDate)}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <SummaryPill
                  label="تأیید نهایی"
                  value={confirmed.length}
                  tone="success"
                />
                <SummaryPill label="در صف" value={pipeline.length} tone="warning" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          icon={<BadgeCheck className="size-4 text-emerald-600" />}
          title="تأیید نهایی / ثبت‌نام قطعی"
          description="دانشجوهایی که وضعیت‌شان تأیید نهایی است."
          count={filteredConfirmed.length}
          tone="success"
          toolbar={
            <SearchField
              value={confirmedSearch}
              onChange={setConfirmedSearch}
              placeholder="جستجو در تأییدشده‌ها…"
            />
          }
        >
          {filteredConfirmed.length === 0 ? (
            <EmptyList text="در این بخش کسی نیست." />
          ) : (
            <div className="space-y-2">
              {filteredConfirmed.map((item) => (
                <EnrollmentPersonRow
                  key={item.id}
                  enrollment={item}
                  userName={userName(item.userId)}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          icon={<Filter className="size-4 text-amber-600" />}
          title="سایر وضعیت‌ها (غیر از تأیید نهایی)"
          description="صف پیگیری؛ با فیلتر وضعیت محدودش کنید."
          count={filteredPipeline.length}
          tone="warning"
          toolbar={
            <div className="space-y-3">
              <SearchField
                value={pipelineSearch}
                onChange={setPipelineSearch}
                placeholder="جستجو در صف…"
              />
              <div className="flex flex-wrap gap-1.5">
                {PIPELINE_FILTERS.map((item) => {
                  const count = filterCounts.get(item.id) ?? 0;
                  const active = pipelineFilter === item.id;
                  if (item.id !== "all" && count === 0) return null;
                  return (
                    <button
                      key={String(item.id)}
                      type="button"
                      onClick={() => setPipelineFilter(item.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition",
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-background text-muted-foreground hover:border-brand/30 hover:text-foreground",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                          active ? "bg-white/20" : "bg-muted",
                        )}
                      >
                        {toFa(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          }
        >
          {filteredPipeline.length === 0 ? (
            <EmptyList text="با این فیلتر موردی نیست." />
          ) : (
            <div className="space-y-2">
              {filteredPipeline.map((item) => (
                <EnrollmentPersonRow
                  key={item.id}
                  enrollment={item}
                  userName={userName(item.userId)}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function matchesSearch(item: Enrollment, name: string, q: string) {
  return (
    name.toLowerCase().includes(q) ||
    String(item.id).includes(q) ||
    item.statusLabel.toLowerCase().includes(q) ||
    item.nextStepByDisplay.toLowerCase().includes(q)
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-3 py-2 text-center backdrop-blur",
        tone === "success" ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white",
      )}
    >
      <p className="text-[10px] opacity-90">{label}</p>
      <p className="text-lg font-bold tabular-nums">{toFa(value)}</p>
    </div>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="ps-9"
      />
    </div>
  );
}

function Panel({
  icon,
  title,
  description,
  count,
  tone,
  toolbar,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  count: number;
  tone: "warning" | "success";
  toolbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-[28rem] flex-col overflow-hidden rounded-[1.75rem] border bg-card shadow-sm",
        tone === "success" ? "border-emerald-200/70" : "border-amber-200/70",
      )}
    >
      <header
        className={cn(
          "border-b px-4 py-4 sm:px-5",
          tone === "success" ? "bg-emerald-50/60" : "bg-amber-50/60",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-white shadow-sm">
              {icon}
            </div>
            <div>
              <p className="font-bold">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge variant={tone === "success" ? "success" : "warning"}>
            {toFa(count)}
          </Badge>
        </div>
        <div className="mt-3">{toolbar}</div>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">{children}</div>
    </section>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-4 py-14 text-center">
      <Users className="mb-2 size-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
