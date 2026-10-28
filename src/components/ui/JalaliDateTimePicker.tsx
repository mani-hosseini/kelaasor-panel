"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toFa } from "@/lib/format";
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  fromJalali,
  isSameJalaliDay,
  jalaliMonthLength,
  jalaliWeekdayIndex,
  toJalali,
  type JalaliDate,
} from "@/lib/jalali";
import { cn } from "@/lib/utils";

const DAY_PRESETS = [
  { label: "۳ روز بعد", days: 3 },
  { label: "یک هفته بعد", days: 7 },
  { label: "دو هفته بعد", days: 14 },
  { label: "یک ماه بعد", days: 30 },
];

const TIME_PRESETS = [
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 21, minute: 0 },
  { hour: 23, minute: 59 },
];

// A deadline usually means "by the end of that day".
const DEFAULT_TIME = { hour: 23, minute: 59 };

const pad = (value: number) => toFa(String(value).padStart(2, "0"));

const longFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatJalaliDeadline(date: Date) {
  return `${longFormatter.format(date)}، ساعت ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parse(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function withTime(date: Date, hour: number, minute: number) {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

type JalaliDateTimePickerProps = {
  /** ISO datetime string, or null when empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Days before today can't be picked (deadlines live in the future). */
  disablePast?: boolean;
  className?: string;
};

export function JalaliDateTimePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ و ساعت",
  disablePast = true,
  className,
}: JalaliDateTimePickerProps) {
  const selected = parse(value);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative", className)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center gap-3 rounded-xl border border-input bg-card ps-2 pe-10 text-right text-sm shadow-sm transition-colors outline-none",
              "hover:border-brand-200 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20",
              open && "border-brand ring-2 ring-brand/20",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
              <CalendarDays className="size-4" />
            </span>
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? formatJalaliDeadline(selected) : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        {selected ? (
          <button
            type="button"
            aria-label="حذف تاریخ"
            onClick={() => onChange(null)}
            className="absolute top-1/2 left-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-danger-soft hover:text-danger"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <PopoverContent dir="rtl" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <CalendarPanel
          selected={selected}
          disablePast={disablePast}
          onChange={(date) => onChange(date ? date.toISOString() : null)}
        />
      </PopoverContent>
    </Popover>
  );
}

function CalendarPanel({
  selected,
  disablePast,
  onChange,
}: {
  selected: Date | null;
  disablePast: boolean;
  onChange: (date: Date | null) => void;
}) {
  // Captured when the popover opens (the panel remounts each time).
  const [openedAt] = useState(() => Date.now());
  const today = useMemo(() => toJalali(new Date(openedAt)), [openedAt]);
  const selectedJalali = selected ? toJalali(selected) : null;
  const [view, setView] = useState(() => {
    const start = selectedJalali ?? today;
    return { year: start.year, month: start.month };
  });
  const [mode, setMode] = useState<"days" | "months">("days");

  const time = selected
    ? { hour: selected.getHours(), minute: selected.getMinutes() }
    : DEFAULT_TIME;
  const todayStart = fromJalali(today).getTime();

  const isDisabled = (day: JalaliDate) => disablePast && fromJalali(day).getTime() < todayStart;

  const pickDay = (day: JalaliDate) => onChange(withTime(fromJalali(day), time.hour, time.minute));

  const setTime = (hour: number, minute: number) => {
    if (selected) onChange(withTime(selected, hour, minute));
  };

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const index = year * 12 + (month - 1) + delta;
      return { year: Math.floor(index / 12), month: (index % 12) + 1 };
    });

  const cells = useMemo(() => {
    const first = fromJalali({ ...view, day: 1 });
    const blanks = jalaliWeekdayIndex(first);
    const length = jalaliMonthLength(view.year, view.month);
    return [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length }, (_, i) => ({ ...view, day: i + 1 })),
    ];
  }, [view]);

  const isPast = selected != null && selected.getTime() < openedAt;

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 rounded-lg"
          aria-label={mode === "days" ? "ماه قبل" : "سال قبل"}
          onClick={() => (mode === "days" ? shiftMonth(-1) : shiftMonth(-12))}
        >
          <ChevronRight className="size-4" />
        </Button>
        <button
          type="button"
          onClick={() => setMode((m) => (m === "days" ? "months" : "days"))}
          className="rounded-lg px-3 py-1 text-sm font-bold transition hover:bg-brand-50 hover:text-brand"
        >
          {mode === "days" ? `${JALALI_MONTHS[view.month - 1]} ${toFa(view.year)}` : toFa(view.year)}
        </button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 rounded-lg"
          aria-label={mode === "days" ? "ماه بعد" : "سال بعد"}
          onClick={() => (mode === "days" ? shiftMonth(1) : shiftMonth(12))}
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {mode === "months" ? (
        <div className="grid grid-cols-3 gap-2 p-3">
          {JALALI_MONTHS.map((name, index) => {
            const month = index + 1;
            const isCurrent = selectedJalali?.year === view.year && selectedJalali.month === month;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setView({ year: view.year, month });
                  setMode("days");
                }}
                className={cn(
                  "h-11 rounded-xl text-sm transition",
                  isCurrent ? "bg-brand font-semibold text-white" : "hover:bg-brand-50 hover:text-brand",
                  today.year === view.year && today.month === month && !isCurrent && "ring-1 ring-brand/40",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-3">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {DAY_PRESETS.map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => {
                  const target = new Date();
                  target.setDate(target.getDate() + preset.days);
                  const jalali = toJalali(target);
                  setView({ year: jalali.year, month: jalali.month });
                  pickDay(jalali);
                }}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {JALALI_WEEKDAYS.map((name, index) => (
              <span
                key={name}
                className={cn(
                  "pb-1 text-[11px] font-semibold text-muted-foreground",
                  index === 6 && "text-danger/80",
                )}
              >
                {name}
              </span>
            ))}
            {cells.map((day, index) => {
              if (!day) return <span key={`blank-${index}`} />;
              const isSelected = selectedJalali != null && isSameJalaliDay(day, selectedJalali);
              const isToday = isSameJalaliDay(day, today);
              const disabled = isDisabled(day);
              const isFriday = index % 7 === 6;
              return (
                <button
                  key={day.day}
                  type="button"
                  disabled={disabled}
                  onClick={() => pickDay(day)}
                  className={cn(
                    "relative mx-auto flex size-10 items-center justify-center rounded-xl text-sm tabular-nums transition",
                    isSelected
                      ? "bg-brand font-bold text-white shadow-[0_8px_20px_-8px_rgba(29,115,99,0.7)]"
                      : "hover:bg-brand-50 hover:text-brand",
                    !isSelected && isFriday && "text-danger/80",
                    !isSelected && isToday && "font-bold text-brand ring-1 ring-brand/40",
                    disabled && "pointer-events-none opacity-30",
                  )}
                >
                  {toFa(day.day)}
                  {isToday && !isSelected ? (
                    <span className="absolute bottom-1 size-1 rounded-full bg-orange" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time */}
      <div className={cn("space-y-2.5 border-t border-border px-3 py-3", !selected && "opacity-50")}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Clock className="size-3.5" /> ساعت
          </span>
          <div dir="ltr" className="flex items-center gap-1">
            <TimeStepper
              value={time.hour}
              disabled={!selected}
              label="ساعت"
              onStep={(delta) => setTime((time.hour + delta + 24) % 24, time.minute)}
            />
            <span className="pb-0.5 text-lg font-bold text-muted-foreground">:</span>
            <TimeStepper
              value={time.minute}
              disabled={!selected}
              label="دقیقه"
              onStep={(delta) => {
                // Snap to 5-minute steps (23:59 → 00 / 55 stays reachable via presets).
                const base = Math.round(time.minute / 5) * 5;
                setTime(time.hour, (base + delta * 5 + 60) % 60);
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIME_PRESETS.map((preset) => {
            const active = selected != null && time.hour === preset.hour && time.minute === preset.minute;
            return (
              <button
                key={`${preset.hour}:${preset.minute}`}
                type="button"
                disabled={!selected}
                onClick={() => setTime(preset.hour, preset.minute)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] tabular-nums transition",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-border text-muted-foreground hover:border-brand-200 hover:bg-brand-50 hover:text-brand",
                )}
              >
                {preset.hour === 23 && preset.minute === 59
                  ? "پایان روز"
                  : `${pad(preset.hour)}:${pad(preset.minute)}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 rounded-b-2xl border-t border-border bg-muted/40 px-3 py-2.5">
        <p className={cn("min-w-0 truncate text-[11px]", isPast ? "text-danger" : "text-muted-foreground")}>
          {selected
            ? isPast
              ? "این زمان گذشته است"
              : formatJalaliDeadline(selected)
            : "روزی را انتخاب کنید"}
        </p>
        <div className="flex shrink-0 gap-1.5">
          {selected ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
              پاک کردن
            </Button>
          ) : null}
          <PopoverClose asChild>
            <Button type="button" size="sm">
              تأیید
            </Button>
          </PopoverClose>
        </div>
      </div>
    </div>
  );
}

function TimeStepper({
  value,
  disabled,
  label,
  onStep,
}: {
  value: number;
  disabled: boolean;
  label: string;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border bg-card p-0.5">
      <button
        type="button"
        disabled={disabled}
        aria-label={`کاهش ${label}`}
        onClick={() => onStep(-1)}
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-brand-50 hover:text-brand"
      >
        <ChevronDown className="size-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-bold tabular-nums">{pad(value)}</span>
      <button
        type="button"
        disabled={disabled}
        aria-label={`افزایش ${label}`}
        onClick={() => onStep(1)}
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-brand-50 hover:text-brand"
      >
        <ChevronUp className="size-3.5" />
      </button>
    </div>
  );
}
