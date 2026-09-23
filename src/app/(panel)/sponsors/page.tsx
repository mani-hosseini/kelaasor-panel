"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteSponsor, useSaveSponsor, useSponsors } from "@/lib/api/queries";
import type { SponsorInput } from "@/lib/api/types";

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url(),
  logo: z.string().min(1),
});

export default function SponsorsPage() {
  const { data = [], isLoading } = useSponsors();
  const save = useSaveSponsor();
  const remove = useDeleteSponsor();
  const form = useForm<SponsorInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", website: "https://", logo: "/sponsors/logo.svg" },
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="محتوا" title="حامی‌ها" description="لوگو و لینک اسپانسرهایی که روی صفحه بوت‌کمپ نمایش داده می‌شوند." />
      <form
        className="surface-panel grid gap-3 p-5 sm:grid-cols-3"
        onSubmit={form.handleSubmit((values) =>
          save.mutate(
            { data: values },
            {
              onSuccess: () => {
                toast.success("حامی اضافه شد");
                form.reset({ name: "", website: "https://", logo: "/sponsors/logo.svg" });
              },
            },
          ),
        )}
      >
        <Field label="نام"><Input {...form.register("name")} /></Field>
        <Field label="وب‌سایت"><Input dir="ltr" {...form.register("website")} /></Field>
        <Field label="مسیر لوگو"><Input dir="ltr" {...form.register("logo")} /></Field>
        <div className="sm:col-span-3">
          <Button type="submit" disabled={save.isPending}>افزودن حامی</Button>
        </div>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? <Skeleton className="h-28 sm:col-span-2" /> : null}
        {data.map((item) => (
          <div key={item.id} className="surface-panel flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">{item.website}</p>
            </div>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(item.id)}>
              حذف
            </Button>
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
