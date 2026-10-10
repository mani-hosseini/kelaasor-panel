"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageDropField } from "@/components/ui/ImageDropField";
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
import {
  useInstructors,
  useSaveSponsor,
  useSaveTopic,
  useSponsors,
  useTopics,
} from "@/lib/api/queries";

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
  const saveTopic = useSaveTopic();
  const saveSponsor = useSaveSponsor();

  const [topicDraft, setTopicDraft] = useState("");
  const [showTopicAdd, setShowTopicAdd] = useState(false);
  const [showSponsorAdd, setShowSponsorAdd] = useState(false);
  const [sponsorDraft, setSponsorDraft] = useState({
    name: "",
    website: "https://",
    logo: "",
  });

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
  const topicId = form.watch("topicId");

  function toggleId(field: "instructorIds" | "sponsorIds", id: number, checked: boolean) {
    const current = form.getValues(field) ?? [];
    form.setValue(
      field,
      checked ? [...current, id] : current.filter((item) => item !== id),
      { shouldDirty: true },
    );
  }

  const selectedTopic = (topics.data ?? []).find((item) => item.id === Number(topicId));
  const selectedSponsorItems = (sponsors.data ?? []).filter((item) =>
    selectedSponsors.includes(item.id),
  );
  const selectedInstructorItems = (instructors.data ?? []).filter((item) =>
    selectedInstructors.includes(item.id),
  );

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
        <div className="sm:col-span-2">
          <ImageDropField
            label="بنر"
            value={form.watch("banner")}
            onChange={(next) => form.setValue("banner", next, { shouldDirty: true })}
          />
        </div>
        <Field
          label="توضیحات"
          className="sm:col-span-2"
          error={form.formState.errors.description?.message}
        >
          <Textarea rows={5} {...form.register("description")} />
        </Field>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>موضوع</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowTopicAdd((value) => !value)}
            >
              <Plus className="size-3.5" />
              موضوع جدید
            </Button>
          </div>
          <Select
            value={String(form.watch("topicId") || "")}
            onValueChange={(value) => form.setValue("topicId", Number(value), { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="انتخاب موضوع" />
            </SelectTrigger>
            <SelectContent>
              {(topics.data ?? []).map((topic) => (
                <SelectItem key={topic.id} value={String(topic.id)}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTopic ? (
            <p className="text-xs text-muted-foreground">
              انتخاب‌شده: <span className="font-semibold text-foreground">{selectedTopic.title}</span>
            </p>
          ) : null}
          {showTopicAdd ? (
            <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-3 sm:flex-row">
              <Input
                placeholder="عنوان موضوع جدید"
                value={topicDraft}
                onChange={(event) => setTopicDraft(event.target.value)}
              />
              <Button
                type="button"
                disabled={saveTopic.isPending || topicDraft.trim().length < 2}
                onClick={() =>
                  saveTopic.mutate(
                    { data: { title: topicDraft.trim() } },
                    {
                      onSuccess: (created) => {
                        form.setValue("topicId", created.id, { shouldDirty: true });
                        setTopicDraft("");
                        setShowTopicAdd(false);
                        toast.success("موضوع اضافه و انتخاب شد");
                      },
                      onError: (error) => toast.error(error.message),
                    },
                  )
                }
              >
                ذخیره موضوع
              </Button>
            </div>
          ) : null}
        </div>

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
          {selectedInstructorItems.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {selectedInstructorItems.map((item) => (
                <span
                  key={item.id}
                  className="rounded-lg bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand"
                >
                  {item.fullName}
                </span>
              ))}
            </div>
          ) : null}
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
          <div className="mb-3 flex items-center justify-between gap-2">
            <Label>اسپانسرها / حامی‌ها</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowSponsorAdd((value) => !value)}
            >
              <Plus className="size-3.5" />
              حامی جدید
            </Button>
          </div>
          {selectedSponsorItems.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {selectedSponsorItems.map((item) => (
                <span
                  key={item.id}
                  className="rounded-lg bg-orange/10 px-2 py-1 text-[11px] font-semibold text-orange"
                >
                  {item.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mb-3 text-xs text-muted-foreground">هنوز حامیی برای این بوت‌کمپ انتخاب نشده.</p>
          )}
          {showSponsorAdd ? (
            <div className="mb-3 space-y-2 rounded-xl border border-dashed border-border p-3">
              <Input
                placeholder="نام حامی"
                value={sponsorDraft.name}
                onChange={(event) =>
                  setSponsorDraft((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              <Input
                dir="ltr"
                placeholder="https://"
                value={sponsorDraft.website}
                onChange={(event) =>
                  setSponsorDraft((prev) => ({ ...prev, website: event.target.value }))
                }
              />
              <ImageDropField
                label="لوگو"
                value={sponsorDraft.logo || null}
                onChange={(next) =>
                  setSponsorDraft((prev) => ({ ...prev, logo: next ?? "" }))
                }
              />
              <Button
                type="button"
                disabled={
                  saveSponsor.isPending ||
                  sponsorDraft.name.trim().length < 2 ||
                  !sponsorDraft.logo
                }
                onClick={() =>
                  saveSponsor.mutate(
                    {
                      data: {
                        name: sponsorDraft.name.trim(),
                        website: sponsorDraft.website.trim(),
                        logo: sponsorDraft.logo,
                      },
                    },
                    {
                      onSuccess: (created) => {
                        const current = form.getValues("sponsorIds") ?? [];
                        form.setValue("sponsorIds", [...current, created.id], {
                          shouldDirty: true,
                        });
                        setSponsorDraft({ name: "", website: "https://", logo: "" });
                        setShowSponsorAdd(false);
                        toast.success("حامی اضافه و انتخاب شد");
                      },
                      onError: (error) => toast.error(error.message),
                    },
                  )
                }
              >
                ذخیره حامی
              </Button>
            </div>
          ) : null}
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
