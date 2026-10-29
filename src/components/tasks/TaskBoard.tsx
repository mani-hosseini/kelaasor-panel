"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  ListTodo,
  PhoneMissed,
  Plus,
  Sparkles,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useTaskBoard,
  type TaskBoardFilter,
} from "@/lib/api/useTaskBoard";
import {
  taskSourceMeta,
  type TaskBoardItem,
  type TaskSource,
} from "@/lib/tasks/derive";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

const SOURCE_ICON: Record<TaskSource, typeof ListTodo> = {
  manual: ListTodo,
  followup: ClipboardList,
  call: PhoneMissed,
  payment: WalletCards,
  enrollment: Sparkles,
};

const SOURCE_ACCENT: Record<TaskSource, string> = {
  manual: "bg-brand",
  followup: "bg-orange",
  call: "bg-amber-500",
  payment: "bg-sky-500",
  enrollment: "bg-muted-foreground",
};

export function TaskBoard({ onCreateClick }: { onCreateClick?: () => void } = {}) {
  const board = useTaskBoard();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [href, setHref] = useState("");

  function openCreate() {
    setCreateOpen(true);
    onCreateClick?.();
  }

  async function submitCreate() {
    if (!title.trim()) {
      toast.message("عنوان تسک را بنویسید");
      return;
    }
    try {
      await board.addManual({ title, meta, href });
      toast.success("تسک اضافه شد");
      setCreateOpen(false);
      setTitle("");
      setMeta("");
      setHref("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیره ممکن نشد");
    }
  }

  if (board.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-[1.75rem]" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-[1.75rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="کار سیستم"
          hint="تماس، پیگیری، فیش"
          value={board.counts.system}
          icon={PhoneMissed}
          tone="orange"
        />
        <StatCard
          label="تسک دستی"
          hint="کارهایی که خودتان ساختید"
          value={board.counts.manual}
          icon={ListTodo}
          tone="brand"
        />
        <StatCard
          label="انجام‌شده"
          hint="آرشیو کارهای تمام‌شده"
          value={board.counts.done}
          icon={CheckCircle2}
          tone="muted"
        />
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-brand/[0.03] px-4 py-3.5 sm:px-5">
          <div className="min-w-0 text-right">
            <p className="text-sm font-bold">صف کارها</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {toFa(board.counts.open)} مورد باز · سیستم خودکار + دستی
            </p>
          </div>
          <Button size="sm" onClick={openCreate} className="shrink-0">
            <Plus className="size-4" />
            تسک جدید
          </Button>
        </div>

        <div className="p-4 sm:p-5">
          <Tabs defaultValue="open">
            <TabsList className="mb-4">
              <TabsTrigger value="open">همه باز · {toFa(board.counts.open)}</TabsTrigger>
              <TabsTrigger value="system">سیستم · {toFa(board.counts.system)}</TabsTrigger>
              <TabsTrigger value="manual">دستی · {toFa(board.counts.manual)}</TabsTrigger>
              <TabsTrigger value="done">انجام‌شده · {toFa(board.counts.done)}</TabsTrigger>
            </TabsList>

            {(["open", "system", "manual", "done"] as TaskBoardFilter[]).map((filter) => (
              <TabsContent key={filter} value={filter} className="mt-0 space-y-2.5">
                <TaskList
                  items={board.itemsFor(filter)}
                  empty={
                    filter === "done"
                      ? "هنوز تسک انجام‌شده‌ای ندارید."
                      : filter === "manual"
                        ? "تسک دستی بازی نیست — یکی بسازید."
                        : filter === "system"
                          ? "کار سیستمی باز نیست. عالی است."
                          : "صف کار خالی است."
                  }
                  onCreate={filter === "manual" || filter === "open" ? openCreate : undefined}
                  onToggle={(item) => void board.toggleManualDone(item)}
                  onDelete={(item) =>
                    void board.removeManual(item).then(
                      () => toast.success("حذف شد"),
                      (error: unknown) =>
                        toast.error(
                          error instanceof Error ? error.message : "حذف ممکن نشد",
                        ),
                    )
                  }
                  onDismiss={(item) => {
                    board.dismiss(item.id);
                    toast.message("از صف برداشته شد");
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسک دستی جدید</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">عنوان</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="مثلاً تماس مجدد با متقاضی فرانت‌اند"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-meta">توضیح کوتاه</Label>
              <Textarea
                id="task-meta"
                rows={2}
                value={meta}
                onChange={(event) => setMeta(event.target.value)}
                placeholder="اختیاری — یادداشت برای خودتان"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-href">لینک داخلی (اختیاری)</Label>
              <Input
                id="task-href"
                dir="ltr"
                className="text-left"
                value={href}
                onChange={(event) => setHref(event.target.value)}
                placeholder="/customers/1"
              />
            </div>
            <div className="flex justify-start gap-2 pt-1">
              <Button onClick={() => void submitCreate()} disabled={board.creating}>
                ذخیره تسک
              </Button>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                انصراف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  hint,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  hint: string;
  value: number;
  icon: typeof ListTodo;
  tone: "brand" | "orange" | "muted";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border px-4 py-4",
        tone === "brand" && "border-brand/20 bg-gradient-to-br from-brand/[0.08] to-card",
        tone === "orange" && "border-orange/20 bg-gradient-to-br from-orange/[0.08] to-card",
        tone === "muted" && "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-right">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{toFa(value)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-2xl",
            tone === "brand" && "bg-brand/10 text-brand",
            tone === "orange" && "bg-orange/10 text-orange",
            tone === "muted" && "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function TaskList({
  items,
  empty,
  onCreate,
  onToggle,
  onDelete,
  onDismiss,
}: {
  items: TaskBoardItem[];
  empty: string;
  onCreate?: () => void;
  onToggle: (item: TaskBoardItem) => void;
  onDelete: (item: TaskBoardItem) => void;
  onDismiss: (item: TaskBoardItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
          <CheckCircle2 className="size-6" />
        </div>
        <p className="mt-3 text-sm font-medium">{empty}</p>
        {onCreate ? (
          <Button size="sm" variant="outline" className="mt-4" onClick={onCreate}>
            <Plus className="size-3.5" />
            ساخت تسک دستی
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const source = taskSourceMeta[item.source];
        const isManual = item.source === "manual";
        const Icon = SOURCE_ICON[item.source];

        return (
          <li key={item.id}>
            <article
              dir="rtl"
              className={cn(
                "group relative flex overflow-hidden rounded-2xl border transition",
                item.done
                  ? "border-border/70 bg-muted/25"
                  : "border-border/90 bg-background hover:border-brand/35 hover:shadow-sm",
              )}
            >
              <span
                className={cn("w-1 shrink-0", item.done ? "bg-border" : SOURCE_ACCENT[item.source])}
              />

              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 px-3.5 py-3.5 sm:px-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <button
                    type="button"
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full transition",
                      item.done ? "text-brand" : "text-muted-foreground hover:text-brand",
                    )}
                    aria-label={item.done ? "باز کردن مجدد" : isManual ? "انجام شد" : "رد کردن از صف"}
                    onClick={() => {
                      if (isManual) onToggle(item);
                      else if (!item.done) onDismiss(item);
                    }}
                  >
                    {item.done ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Circle className="size-5" />
                    )}
                  </button>

                  <div className="min-w-0 text-right">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg",
                          item.done ? "bg-muted text-muted-foreground" : "bg-muted/80 text-foreground/70",
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <p
                        className={cn(
                          "text-sm font-semibold leading-snug",
                          item.done && "text-muted-foreground line-through",
                        )}
                      >
                        {item.title}
                      </p>
                      <Badge variant={source.tone} className="font-normal">
                        {source.label}
                      </Badge>
                    </div>
                    <p className="mt-1.5 pe-9 text-[11px] leading-relaxed text-muted-foreground">
                      {item.meta}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 rounded-xl"
                  >
                    <Link href={item.href}>
                      باز کردن
                      <ArrowLeft className="size-3.5" />
                    </Link>
                  </Button>
                  {isManual ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-xl text-destructive hover:bg-danger-soft"
                      aria-label="حذف"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : !item.done ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-xl text-muted-foreground"
                      aria-label="رد کردن"
                      onClick={() => onDismiss(item)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
