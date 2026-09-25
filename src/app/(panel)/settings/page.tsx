"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings, useUpdateSettings } from "@/lib/api/queries";
import type { AppSettings } from "@/lib/api/types";

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const update = useUpdateSettings();
  const form = useForm<AppSettings>();

  useEffect(() => {
    if (data) form.reset(data);
  }, [data, form]);

  if (isLoading || !data) return <Skeleton className="h-96" />;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="سیستم"
        title="تنظیمات عملیات"
        description="اطلاعاتی که در سایت کلاسور برای آپلود فیش و ورود به LMS به کاربر نشان داده می‌شود."
      />

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          update.mutate(values, {
            onSuccess: () => toast.success("تنظیمات ذخیره شد"),
            onError: (error) => toast.error(error.message),
          }),
        )}
      >
        <Card>
          <CardHeader>
            <CardTitle>مقصد پرداخت (رسید کارت‌به‌کارت)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="نام بانک">
              <Input {...form.register("bankName")} />
            </Field>
            <Field label="نام صاحب حساب">
              <Input {...form.register("bankOwnerName")} />
            </Field>
            <Field label="شماره کارت">
              <Input dir="ltr" {...form.register("bankCardNumber")} />
            </Field>
            <Field label="شبا">
              <Input dir="ltr" {...form.register("bankSheba")} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LMS و اقساط</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="آدرس LMS">
              <Input dir="ltr" {...form.register("lmsUrl")} />
            </Field>
            <Field label="تعداد پیش‌فرض اقساط BNPL">
              <Input type="number" {...form.register("defaultInstallmentCount", { valueAsNumber: true })} />
            </Field>
          </CardContent>
        </Card>

        <Button type="submit" disabled={update.isPending}>
          ذخیره تنظیمات
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
