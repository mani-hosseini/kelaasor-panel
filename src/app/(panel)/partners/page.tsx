"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeletePartner, usePartners, useSavePartner } from "@/lib/api/queries";
import type { PartnerCompanyInput } from "@/lib/api/types";

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url(),
  logo: z.string().min(1),
});

export default function PartnersPage() {
  const { data = [], isLoading } = usePartners();
  const save = useSavePartner();
  const remove = useDeletePartner();
  const [editingId, setEditingId] = useState<number | null>(null);
  const form = useForm<PartnerCompanyInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", website: "https://", logo: "/partners/logo.svg" },
  });

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="آموزش"
        title="شرکای صفحه اصلی"
        description="لوگوهایی که در بخش Partner Companies سایت کلاسور کمپ نمایش داده می‌شوند (جدا از حامی هر دوره)."
      />
      <form
        className="surface-panel grid gap-3 p-5 sm:grid-cols-3"
        onSubmit={form.handleSubmit((values) =>
          save.mutate(
            { id: editingId ?? undefined, data: values },
            {
              onSuccess: () => {
                toast.success(editingId ? "به‌روز شد" : "اضافه شد");
                setEditingId(null);
                form.reset({ name: "", website: "https://", logo: "/partners/logo.svg" });
              },
            },
          ),
        )}
      >
        <Field label="نام">
          <Input {...form.register("name")} />
        </Field>
        <Field label="وب‌سایت">
          <Input dir="ltr" {...form.register("website")} />
        </Field>
        <Field label="مسیر لوگو">
          <Input dir="ltr" {...form.register("logo")} />
        </Field>
        <div className="flex gap-2 sm:col-span-3">
          <Button type="submit" disabled={save.isPending}>
            {editingId ? "ذخیره ویرایش" : "افزودن شریک"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                form.reset({ name: "", website: "https://", logo: "/partners/logo.svg" });
              }}
            >
              انصراف
            </Button>
          ) : null}
        </div>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? <Skeleton className="h-28 sm:col-span-2" /> : null}
        {data.map((item) => (
          <div key={item.id} className="surface-panel flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {item.website}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingId(item.id);
                  form.reset({ name: item.name, website: item.website, logo: item.logo });
                }}
              >
                ویرایش
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => remove.mutate(item.id)}
              >
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
