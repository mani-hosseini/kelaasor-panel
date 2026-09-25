"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_STATUS,
  eventStatusLabels,
  type Bootcamp,
  type BootcampInput,
} from "@/lib/api/types";
import { useInstructors, useSponsors, useTopics } from "@/lib/api/queries";

const schema = z.object({
  title: z.string().min(3, "عنوان را وارد کنید."),
  slug: z.string().min(3, "اسلاگ را وارد کنید."),
  brief: z.string().min(8, "خلاصه کوتاه لازم است."),
  description: z.string().min(12, "توضیحات را کامل کنید."),
  banner: z.string().nullable(),
  durationInWeeks: z.coerce.number().min(1),
  capacity: z.coerce.number().min(1),
  topicId: z.coerce.number().min(1),
  hasBnpl: z.boolean(),
  installmentCount: z.coerce.number().min(1).max(24),
  primaryPrice: z.coerce.number().min(0),
  finalPrice: z.coerce.number().min(0),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  registrationDeadline: z.string().min(4),
  eventStatus: z.coerce.number(),
  sessionsScheduleDays: z.string().min(2),
  sessionsScheduleHours: z.string().min(2),
  instructorIds: z.array(z.number()),
  sponsorIds: z.array(z.number()),
});

export type BootcampFormValues = z.infer<typeof schema>;

export function BootcampForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: Bootcamp;
  submitting?: boolean;
  onSubmit: (values: BootcampInput) => void;
}) {
  const topics = useTopics();
  const instructors = useInstructors();
  const sponsors = useSponsors();
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      brief: initial?.brief ?? "",
      description: initial?.description ?? "",
      durationInWeeks: initial?.durationInWeeks ?? 12,
      capacity: initial?.capacity ?? 24,
      topicId: initial?.topicId ?? 1,
      hasBnpl: initial?.hasBnpl ?? true,
      installmentCount: initial?.installmentCount ?? 3,
      banner: initial?.banner ?? "",
      primaryPrice: initial?.currentEvent?.primaryPrice ?? 20_000_000,
      finalPrice: initial?.currentEvent?.finalPrice ?? 18_000_000,
      startDate: initial?.currentEvent?.startDate ?? "",
      endDate: initial?.currentEvent?.endDate ?? "",
      registrationDeadline:
        initial?.currentEvent?.registrationDeadline ?? initial?.currentEvent?.startDate ?? "",
      eventStatus: initial?.currentEvent?.status ?? EVENT_STATUS.REGISTERING,
      sessionsScheduleDays: initial?.currentEvent?.sessionsScheduleDays ?? "شنبه و سه‌شنبه",
      sessionsScheduleHours: initial?.currentEvent?.sessionsScheduleHours ?? "۱۸:۰۰ تا ۲۱:۰۰",
      instructorIds: initial?.instructorIds ?? [],
      sponsorIds: initial?.sponsorIds ?? [],
    },
  });

  const selectedInstructors = form.watch("instructorIds") ?? [];
  const selectedSponsors = form.watch("sponsorIds") ?? [];
  const hasBnpl = form.watch("hasBnpl");

  function toggleId(field: "instructorIds" | "sponsorIds", id: number, checked: boolean) {
    const current = form.getValues(field) ?? [];
    form.setValue(
      field,
      checked ? [...current, id] : current.filter((item) => item !== id),
      { shouldDirty: true },
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) =>
        onSubmit({
          ...values,
          banner: values.banner?.trim() ? values.banner.trim() : null,
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="عنوان" error={form.formState.errors.title?.message}>
          <Input {...form.register("title")} />
        </Field>
        <Field label="اسلاگ" error={form.formState.errors.slug?.message}>
          <Input dir="ltr" className="text-left" {...form.register("slug")} />
        </Field>
        <Field label="خلاصه" className="sm:col-span-2" error={form.formState.errors.brief?.message}>
          <Input {...form.register("brief")} />
        </Field>
        <Field label="بنر (URL تصویر)" className="sm:col-span-2">
          <Input dir="ltr" className="text-left" placeholder="/banners/..." {...form.register("banner")} />
        </Field>
        <Field
          label="توضیحات"
          className="sm:col-span-2"
          error={form.formState.errors.description?.message}
        >
          <Textarea rows={5} {...form.register("description")} />
        </Field>
        <Field label="موضوع">
          <Select
            value={String(form.watch("topicId"))}
            onValueChange={(value) => form.setValue("topicId", Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(topics.data ?? []).map((topic) => (
                <SelectItem key={topic.id} value={String(topic.id)}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="وضعیت رویداد (سایت)">
          <Select
            value={String(form.watch("eventStatus"))}
            onValueChange={(value) => form.setValue("eventStatus", Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(eventStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="مدت (هفته)">
          <Input type="number" {...form.register("durationInWeeks")} />
        </Field>
        <Field label="ظرفیت">
          <Input type="number" {...form.register("capacity")} />
        </Field>
        <div className="flex items-center justify-between rounded-2xl border border-border px-4">
          <Label>پرداخت اقساطی (BNPL)</Label>
          <Switch
            checked={hasBnpl}
            onCheckedChange={(value) => form.setValue("hasBnpl", value)}
          />
        </div>
        <Field label="تعداد اقساط BNPL">
          <Input type="number" disabled={!hasBnpl} {...form.register("installmentCount")} />
        </Field>
        <Field label="قیمت اصلی">
          <Input type="number" {...form.register("primaryPrice")} />
        </Field>
        <Field label="قیمت نهایی">
          <Input type="number" {...form.register("finalPrice")} />
        </Field>
        <Field label="شروع دوره">
          <Input type="date" {...form.register("startDate")} />
        </Field>
        <Field label="پایان دوره">
          <Input type="date" {...form.register("endDate")} />
        </Field>
        <Field label="مهلت ثبت‌نام (دیده می‌شود در سایت)">
          <Input type="date" {...form.register("registrationDeadline")} />
        </Field>
        <Field label="روزهای کلاس">
          <Input {...form.register("sessionsScheduleDays")} />
        </Field>
        <Field label="ساعت کلاس">
          <Input {...form.register("sessionsScheduleHours")} />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border p-4">
          <Label className="mb-3 block">مدرس‌ها / منتورها</Label>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {(instructors.data ?? []).map((item) => {
              const checked = selectedInstructors.includes(item.id);
              return (
                <label key={item.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--brand)]"
                    checked={checked}
                    onChange={(event) => toggleId("instructorIds", item.id, event.target.checked)}
                  />
                  <span>
                    {item.fullName}
                    <span className="text-muted-foreground"> — {item.jobTitle}</span>
                  </span>
                </label>
              );
            })}
            {(instructors.data ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">هنوز مدرسی ثبت نشده.</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-border p-4">
          <Label className="mb-3 block">اسپانسرها</Label>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {(sponsors.data ?? []).map((item) => {
              const checked = selectedSponsors.includes(item.id);
              return (
                <label key={item.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--brand)]"
                    checked={checked}
                    onChange={(event) => toggleId("sponsorIds", item.id, event.target.checked)}
                  />
                  <span>{item.name}</span>
                </label>
              );
            })}
            {(sponsors.data ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">هنوز اسپانسری ثبت نشده.</p>
            ) : null}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={submitting}>
        ذخیره بوت‌کمپ
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  className,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
