"use client";

import { useMemo, useState } from "react";
import { Layers3, Search } from "lucide-react";

import { BootcampCatalogCard } from "@/components/bootcamps/BootcampCatalogCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Bootcamp, Topic } from "@/lib/api/types";
import {
  bootcampLifecycle,
  compareBootcampsByLifecycle,
  type BootcampLifecycle,
} from "@/lib/bootcampStatus";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | BootcampLifecycle;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "همه وضعیت‌ها" },
  { id: "ongoing", label: "در حال برگزاری" },
  { id: "registering", label: "در حال ثبت‌نام" },
  { id: "pre", label: "پیش‌ثبت‌نام" },
  { id: "completed", label: "پایان‌یافته" },
  { id: "none", label: "بدون رویداد" },
];

type Props = {
  bootcamps: Bootcamp[];
  topics: Topic[];
  loading?: boolean;
};

export function BootcampTopicDirectory({ bootcamps, topics, loading }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [topicFilter, setTopicFilter] = useState<number | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bootcamps
      .filter((item) => {
        if (topicFilter !== "all" && item.topicId !== topicFilter) return false;
        if (statusFilter !== "all" && bootcampLifecycle(item) !== statusFilter) {
          return false;
        }
        if (!q) return true;
        const topicTitle =
          topics.find((topic) => topic.id === item.topicId)?.title ?? "";
        return `${item.title} ${item.brief} ${topicTitle}`.toLowerCase().includes(q);
      })
      .sort(compareBootcampsByLifecycle);
  }, [bootcamps, search, statusFilter, topicFilter, topics]);

  const sections = useMemo(() => {
    const byTopic = new Map<number, Bootcamp[]>();
    for (const bootcamp of filtered) {
      const list = byTopic.get(bootcamp.topicId) ?? [];
      list.push(bootcamp);
      byTopic.set(bootcamp.topicId, list);
    }

    const orderedTopics = [...topics].sort((a, b) => a.title.localeCompare(b.title, "fa"));
    const known = orderedTopics
      .map((topic) => ({
        topic,
        items: byTopic.get(topic.id) ?? [],
      }))
      .filter((section) => section.items.length > 0);

    const orphanIds = [...byTopic.keys()].filter(
      (id) => !topics.some((topic) => topic.id === id),
    );
    const orphans =
      orphanIds.length > 0
        ? [
            {
              topic: { id: -1, title: "بدون موضوع" } as Topic,
              items: orphanIds.flatMap((id) => byTopic.get(id) ?? []),
            },
          ]
        : [];

    return [...known, ...orphans];
  }, [filtered, topics]);

  const counts = useMemo(() => {
    const map: Record<StatusFilter, number> = {
      all: bootcamps.length,
      pre: 0,
      registering: 0,
      ongoing: 0,
      completed: 0,
      none: 0,
    };
    for (const item of bootcamps) {
      map[bootcampLifecycle(item)] += 1;
    }
    return map;
  }, [bootcamps]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی بوت‌کمپ یا موضوع…"
              className="ps-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {toFa(filtered.length)} بوت‌کمپ در {toFa(sections.length)} موضوع
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <FilterChip
            active={topicFilter === "all"}
            onClick={() => setTopicFilter("all")}
            label="همه موضوع‌ها"
            count={bootcamps.length}
          />
          {topics.map((topic) => {
            const count = bootcamps.filter((item) => item.topicId === topic.id).length;
            if (!count) return null;
            return (
              <FilterChip
                key={topic.id}
                active={topicFilter === topic.id}
                onClick={() => setTopicFilter(topic.id)}
                label={topic.title}
                count={count}
              />
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.id}
              active={statusFilter === filter.id}
              onClick={() => setStatusFilter(filter.id)}
              label={filter.label}
              count={counts[filter.id]}
              tone="status"
            />
          ))}
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-card/60 px-6 py-16 text-center">
          <Layers3 className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            با این فیلتر بوت‌کمپی پیدا نشد.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.topic.id}
              className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-brand/[0.04] px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Layers3 className="size-4" />
                  </span>
                  <div className="min-w-0 text-right">
                    <h2 className="text-base font-bold">{section.topic.title}</h2>
                    <p className="text-[11px] text-muted-foreground">
                      دوره‌ها و ترم‌های این موضوع
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{toFa(section.items.length)} دوره</Badge>
              </header>

              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                {section.items.map((bootcamp) => (
                  <BootcampCatalogCard key={bootcamp.id} bootcamp={bootcamp} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  tone = "topic",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "topic" | "status";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition",
        active
          ? tone === "status"
            ? "border-orange/40 bg-orange/10 text-orange"
            : "border-brand/40 bg-brand text-white"
          : "border-border bg-background text-muted-foreground hover:border-brand/30 hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-md px-1.5 py-px text-[10px] tabular-nums",
          active
            ? tone === "status"
              ? "bg-orange/15"
              : "bg-white/20"
            : "bg-muted",
        )}
      >
        {toFa(count)}
      </span>
    </button>
  );
}
