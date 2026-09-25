"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateUser } from "@/lib/api/queries";
import type { AdminUser } from "@/lib/api/types";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  birthDate: string;
  englishFirstName: string;
  englishLastName: string;
  educationLevelDisplay: string;
  fieldOfStudy: string;
  linkedinUrl: string;
  address: string;
  hasPriorExperience: boolean;
  experienceDescription: string;
};

export function CustomerProfileForm({ user }: { user: AdminUser }) {
  const update = useUpdateUser();
  const form = useForm<FormValues>({
    defaultValues: toValues(user),
  });

  useEffect(() => {
    form.reset(toValues(user));
  }, [user, form]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        update.mutate(
          {
            id: user.id,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            profile: {
              nationalId: values.nationalId || null,
              birthDate: values.birthDate || null,
              englishFirstName: values.englishFirstName || null,
              englishLastName: values.englishLastName || null,
              email: values.email || null,
              educationLevelDisplay: values.educationLevelDisplay || null,
              fieldOfStudy: values.fieldOfStudy || null,
              linkedinUrl: values.linkedinUrl || null,
              address: values.address || null,
              hasPriorExperience: values.hasPriorExperience,
              experienceDescription: values.experienceDescription || null,
            },
          },
          { onSuccess: () => toast.success("پروفایل مشتری ذخیره شد") },
        ),
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="نام">
          <Input {...form.register("firstName")} />
        </Field>
        <Field label="نام خانوادگی">
          <Input {...form.register("lastName")} />
        </Field>
        <Field label="موبایل">
          <Input dir="ltr" {...form.register("phoneNumber")} />
        </Field>
        <Field label="ایمیل">
          <Input dir="ltr" {...form.register("email")} />
        </Field>
        <Field label="کد ملی">
          <Input dir="ltr" {...form.register("nationalId")} />
        </Field>
        <Field label="تاریخ تولد">
          <Input type="date" {...form.register("birthDate")} />
        </Field>
        <Field label="نام انگلیسی">
          <Input dir="ltr" {...form.register("englishFirstName")} />
        </Field>
        <Field label="نام‌خانوادگی انگلیسی">
          <Input dir="ltr" {...form.register("englishLastName")} />
        </Field>
        <Field label="تحصیلات">
          <Input {...form.register("educationLevelDisplay")} />
        </Field>
        <Field label="رشته">
          <Input {...form.register("fieldOfStudy")} />
        </Field>
        <Field label="لینکدین" className="sm:col-span-2">
          <Input dir="ltr" {...form.register("linkedinUrl")} />
        </Field>
        <Field label="آدرس" className="sm:col-span-2">
          <Textarea rows={2} {...form.register("address")} />
        </Field>
        <div className="flex items-center justify-between rounded-2xl border border-border px-4 sm:col-span-2">
          <Label>تجربه قبلی دارد</Label>
          <Switch
            checked={form.watch("hasPriorExperience")}
            onCheckedChange={(value) => form.setValue("hasPriorExperience", value)}
          />
        </div>
        <Field label="توضیح تجربه" className="sm:col-span-2">
          <Textarea rows={3} {...form.register("experienceDescription")} />
        </Field>
      </div>
      <Button type="submit" disabled={update.isPending}>
        ذخیره پروفایل
      </Button>
    </form>
  );
}

function toValues(user: AdminUser): FormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    nationalId: user.profile.nationalId ?? "",
    birthDate: user.profile.birthDate?.slice(0, 10) ?? "",
    englishFirstName: user.profile.englishFirstName ?? "",
    englishLastName: user.profile.englishLastName ?? "",
    educationLevelDisplay: user.profile.educationLevelDisplay ?? "",
    fieldOfStudy: user.profile.fieldOfStudy ?? "",
    linkedinUrl: user.profile.linkedinUrl ?? "",
    address: user.profile.address ?? "",
    hasPriorExperience: user.profile.hasPriorExperience,
    experienceDescription: user.profile.experienceDescription ?? "",
  };
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
