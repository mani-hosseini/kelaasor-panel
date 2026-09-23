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
import type { Bootcamp, BootcampInput } from "@/lib/api/types";
import { useTopics } from "@/lib/api/queries";

const schema = z.object({
  title: z.string().min(3, "عنوان را وارد کنید."),
  slug: z.string().min(3, "اسلاگ را وارد کنید."),
  brief: z.string().min(8, "خلاصه کوتاه لازم است."),
  description: z.string().min(12, "توضیحات را کامل کنید."),
  durationInWeeks: z.coerce.number().min(1),
  capacity: z.coerce.number().min(1),
  topicId: z.coerce.number().min(1),
  hasBnpl: z.boolean(),
  primaryPrice: z.coerce.number().min(0),
  finalPrice: z.coerce.number().min(0),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  sessionsScheduleDays: z.string().min(2),
  sessionsScheduleHours: z.string().min(2),
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
      primaryPrice: initial?.currentEvent?.primaryPrice ?? 20_000_000,
      finalPrice: initial?.currentEvent?.finalPrice ?? 18_000_000,
      startDate: initial?.currentEvent?.startDate ?? "",
      endDate: initial?.currentEvent?.endDate ?? "",
      sessionsScheduleDays: initial?.currentEvent?.sessionsScheduleDays ?? "شنبه و سه‌شنبه",
      sessionsScheduleHours: initial?.currentEvent?.sessionsScheduleHours ?? "۱۸:۰۰ تا ۲۱:۰۰",
    },
  });

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
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
        <Field label="توضیحات" className="sm:col-span-2" error={form.formState.errors.description?.message}>
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
        <Field label="مدت (هفته)">
          <Input type="number" {...form.register("durationInWeeks")} />
        </Field>
        <Field label="ظرفیت">
          <Input type="number" {...form.register("capacity")} />
        </Field>
        <div className="flex items-center justify-between rounded-2xl border border-border px-4">
          <Label>پرداخت اقساطی (BNPL)</Label>
          <Switch checked={form.watch("hasBnpl")} onCheckedChange={(value) => form.setValue("hasBnpl", value)} />
        </div>
        <Field label="قیمت اصلی">
          <Input type="number" {...form.register("primaryPrice")} />
        </Field>
        <Field label="قیمت نهایی">
          <Input type="number" {...form.register("finalPrice")} />
        </Field>
        <Field label="شروع ثبت‌نام">
          <Input type="date" {...form.register("startDate")} />
        </Field>
        <Field label="پایان ثبت‌نام">
          <Input type="date" {...form.register("endDate")} />
        </Field>
        <Field label="روزهای کلاس">
          <Input {...form.register("sessionsScheduleDays")} />
        </Field>
        <Field label="ساعت کلاس">
          <Input {...form.register("sessionsScheduleHours")} />
        </Field>
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
