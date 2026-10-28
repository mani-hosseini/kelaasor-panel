"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JalaliDateTimePicker } from "@/components/ui/JalaliDateTimePicker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  SurveyFormEvent,
  SurveyInput,
  SurveyQuestion,
  SurveyQuestionKind,
} from "@/lib/api/surveys.api";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

import { questionKindLabels } from "./survey-meta";

const DEFAULT_CHOICES = [
  { text: "عالی", score: 4 },
  { text: "خوب", score: 3 },
  { text: "متوسط", score: 2 },
  { text: "ضعیف", score: 1 },
];

type SurveyFormProps = {
  events: SurveyFormEvent[];
  initial: {
    bootcampEventId: number | null;
    instructorId: number | null;
    title: string;
    description: string;
    closesAt: string | null;
    questions: SurveyQuestion[];
  };
  submitting: boolean;
  submitLabel: string;
  onSubmit: (input: SurveyInput) => void;
  onCancel?: () => void;
  /** Sent surveys: the SMS already went to this event's students. */
  lockAudience?: boolean;
  /** Surveys with responses: only wording can change, not questions/choices/scores. */
  lockStructure?: boolean;
};

function validate(input: Partial<SurveyInput>): string | null {
  if (!input.bootcampEventId) return "دوره بوت‌کمپ را انتخاب کنید.";
  if (!input.instructorId) return "مدرس را انتخاب کنید.";
  const questions = input.questions ?? [];
  if (!questions.length) return "حداقل یک سوال اضافه کنید.";
  if (questions.filter((q) => q.kind === "nps").length > 1) {
    return "فقط یک سوال امتیازی ۰ تا ۱۰ (NPS) مجاز است.";
  }
  for (const [index, question] of questions.entries()) {
    if (!question.text.trim()) return `متن سوال ${toFa(index + 1)} خالی است.`;
    if (question.kind === "choice") {
      if (question.choices.length < 2) return `سوال ${toFa(index + 1)} حداقل دو گزینه لازم دارد.`;
      if (question.choices.some((c) => !c.text.trim())) {
        return `گزینه خالی در سوال ${toFa(index + 1)} وجود دارد.`;
      }
    }
  }
  return null;
}

export function SurveyForm({
  events,
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  lockAudience = false,
  lockStructure = false,
}: SurveyFormProps) {
  const [eventId, setEventId] = useState(initial.bootcampEventId ? String(initial.bootcampEventId) : "");
  const [instructorId, setInstructorId] = useState(
    initial.instructorId ? String(initial.instructorId) : "",
  );
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [closesAt, setClosesAt] = useState<string | null>(initial.closesAt);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(initial.questions);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === eventId) ?? null,
    [events, eventId],
  );
  const hasNps = questions.some((q) => q.kind === "nps");

  const updateQuestion = (index: number, patch: Partial<SurveyQuestion>) =>
    setQuestions((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const moveQuestion = (index: number, delta: number) =>
    setQuestions((items) => {
      const target = index + delta;
      if (target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const addQuestion = (kind: SurveyQuestionKind) =>
    setQuestions((items) => [
      ...items,
      {
        kind,
        text: "",
        isRequired: kind !== "text",
        choices: kind === "choice" ? DEFAULT_CHOICES.map((c) => ({ ...c })) : [],
      },
    ]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const input: SurveyInput = {
      bootcampEventId: Number(eventId),
      instructorId: Number(instructorId),
      title: title.trim(),
      description: description.trim(),
      closesAt,
      questions: questions.map((q) => ({
        ...q,
        text: q.text.trim(),
        choices: q.choices.map((c) => ({ ...c, text: c.text.trim() })),
      })),
    };
    const error = validate(input);
    if (error) {
      toast.error(error);
      return;
    }
    onSubmit(input);
  };

  return (
    <form dir="rtl" className="space-y-6 text-right" onSubmit={handleSubmit}>
      <section className="surface-panel space-y-4 p-5">
        <h2 className="font-bold">مخاطب نظرسنجی</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>دوره بوت‌کمپ</Label>
            <Select
              value={eventId}
              disabled={lockAudience}
              onValueChange={(value) => {
                setEventId(value);
                setInstructorId("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب دوره" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={String(event.id)}>
                    {event.bootcampTitle} — {event.session} ({event.statusDisplay})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lockAudience ? (
              <p className="text-xs text-muted-foreground">
                نظرسنجی ارسال شده؛ دوره و مدرس قابل تغییر نیستند.
              </p>
            ) : selectedEvent ? (
              <p className="text-xs text-muted-foreground">
                پیامک برای {toFa(selectedEvent.confirmedCount)} دانشجوی ثبت‌نام‌نهایی‌شده این دوره ارسال می‌شود.
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>مدرس</Label>
            <Select
              value={instructorId}
              onValueChange={setInstructorId}
              disabled={lockAudience || !selectedEvent}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedEvent ? "انتخاب مدرس" : "ابتدا دوره را انتخاب کنید"} />
              </SelectTrigger>
              <SelectContent>
                {(selectedEvent?.instructors ?? []).map((instructor) => (
                  <SelectItem key={instructor.id} value={String(instructor.id)}>
                    {instructor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEvent && !selectedEvent.instructors.length ? (
              <p className="text-xs text-danger">
                هیچ مدرسی به این بوت‌کمپ متصل نیست؛ ابتدا از ویرایش بوت‌کمپ مدرس را اضافه کنید.
              </p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>عنوان (اختیاری)</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="پیش‌فرض: نظرسنجی + نام مدرس"
            />
          </div>
          <div className="space-y-1.5">
            <Label>مهلت پاسخ (اختیاری)</Label>
            <JalaliDateTimePicker
              value={closesAt}
              onChange={setClosesAt}
              placeholder="بدون مهلت"
            />
            {!closesAt ? (
              <p className="text-xs text-muted-foreground">
                بدون مهلت، نظرسنجی تا وقتی دستی بسته شود باز می‌ماند.
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>توضیح برای دانشجو (اختیاری)</Label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="مثلاً: پاسخ‌ها ناشناس هستند و فقط برای بهبود کیفیت دوره‌ها استفاده می‌شوند."
          />
        </div>
      </section>

      <section className="surface-panel space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">سوالات ({toFa(questions.length)})</h2>
          <div className={cn("flex flex-wrap gap-2", lockStructure && "hidden")}>
            <Button type="button" size="sm" variant="outline" disabled={hasNps} onClick={() => addQuestion("nps")}>
              <Plus className="size-4" /> امتیاز ۰–۱۰
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("choice")}>
              <Plus className="size-4" /> چندگزینه‌ای
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("text")}>
              <Plus className="size-4" /> تشریحی
            </Button>
          </div>
        </div>

        {lockStructure ? (
          <p className="rounded-xl bg-warning-soft px-3 py-2 text-xs leading-6 text-warning">
            این نظرسنجی پاسخ دارد؛ برای سالم ماندن گزارش، فقط متن سوال‌ها و گزینه‌ها و الزامی بودن قابل
            ویرایش است. افزودن، حذف یا جابه‌جایی سوال و تغییر امتیاز گزینه‌ها ممکن نیست.
          </p>
        ) : null}

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز سوالی اضافه نشده.</p>
        ) : null}

        <ol className="space-y-3">
          {questions.map((question, index) => (
            <li key={index} className="space-y-3 rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-brand">
                  سوال {toFa(index + 1)} · {questionKindLabels[question.kind]}
                </span>
                <div className="flex items-center gap-1">
                  <label className="ml-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={question.isRequired}
                      onCheckedChange={(checked) => updateQuestion(index, { isRequired: checked })}
                    />
                    الزامی
                  </label>
                  {lockStructure ? null : (
                    <>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="بالا"
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, -1)}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="پایین"
                        disabled={index === questions.length - 1}
                        onClick={() => moveQuestion(index, 1)}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="حذف سوال"
                        onClick={() => setQuestions((items) => items.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="size-4 text-danger" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Textarea
                rows={2}
                value={question.text}
                onChange={(event) => updateQuestion(index, { text: event.target.value })}
                placeholder="متن سوال"
              />
              {question.kind === "nps" ? (
                <p className="text-xs text-muted-foreground">
                  دانشجو عددی بین ۰ تا ۱۰ انتخاب می‌کند؛ NPS نظرسنجی از همین سوال محاسبه می‌شود.
                </p>
              ) : null}
              {question.kind === "choice" ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    «امتیاز» هر گزینه برای محاسبه میانگین در گزارش است و به دانشجو نمایش داده نمی‌شود.
                  </p>
                  {question.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-2">
                      <Input
                        value={choice.text}
                        placeholder={`گزینه ${toFa(choiceIndex + 1)}`}
                        onChange={(event) =>
                          updateQuestion(index, {
                            choices: question.choices.map((c, i) =>
                              i === choiceIndex ? { ...c, text: event.target.value } : c,
                            ),
                          })
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        dir="ltr"
                        className="w-24"
                        aria-label="امتیاز گزینه"
                        disabled={lockStructure}
                        value={choice.score}
                        onChange={(event) =>
                          updateQuestion(index, {
                            choices: question.choices.map((c, i) =>
                              i === choiceIndex ? { ...c, score: Math.max(0, Number(event.target.value) || 0) } : c,
                            ),
                          })
                        }
                      />
                      {lockStructure ? null : (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="حذف گزینه"
                          onClick={() =>
                            updateQuestion(index, {
                              choices: question.choices.filter((_, i) => i !== choiceIndex),
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {lockStructure ? null : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateQuestion(index, {
                          choices: [...question.choices, { text: "", score: 0 }],
                        })
                      }
                    >
                      <Plus className="size-4" /> افزودن گزینه
                    </Button>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "در حال ذخیره…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        ) : null}
      </div>
    </form>
  );
}
