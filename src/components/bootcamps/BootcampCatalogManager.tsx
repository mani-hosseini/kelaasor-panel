"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Handshake, Plus, Tags, Trash2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageDropField } from "@/components/ui/ImageDropField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeletePartner,
  useDeleteSponsor,
  useDeleteTopic,
  usePartners,
  useSavePartner,
  useSaveSponsor,
  useSaveTopic,
  useSponsors,
  useTopics,
} from "@/lib/api/queries";
import type { PartnerCompanyInput, SponsorInput } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type CatalogTab = "topics" | "sponsors" | "partners";

const tabs: { id: CatalogTab; label: string; icon: typeof Tags }[] = [
  { id: "topics", label: "موضوع‌ها", icon: Tags },
  { id: "sponsors", label: "حامی‌ها", icon: Handshake },
  { id: "partners", label: "شرکا", icon: Building2 },
];

const topicSchema = z.object({ title: z.string().min(2, "عنوان لازم است.") });
const brandSchema = z.object({
  name: z.string().min(2),
  website: z.string().url("آدرس معتبر وارد کنید"),
  logo: z.string().min(1, "لوگو را انتخاب کنید"),
});

export function BootcampCatalogManager() {
  const [tab, setTab] = useState<CatalogTab>("topics");

  return (
    <section dir="rtl" className="space-y-4 text-right">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">کاتالوگ بوت‌کمپ</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            موضوع، حامی و شریک را همین‌جا اضافه کنید و لیست فعلی را ببینید — برای اتصال به هر بوت‌کمپ از فرم جزئیات استفاده کنید.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card/80 p-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "topics" ? <TopicsPanel /> : null}
      {tab === "sponsors" ? <SponsorsPanel /> : null}
      {tab === "partners" ? <PartnersPanel /> : null}
    </section>
  );
}

function TopicsPanel() {
  const { data = [], isLoading } = useTopics();
  const save = useSaveTopic();
  const remove = useDeleteTopic();
  const form = useForm({
    resolver: zodResolver(topicSchema),
    defaultValues: { title: "" },
  });

  return (
    <div className="surface-panel space-y-4 p-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={form.handleSubmit((values) =>
          save.mutate(
            { data: values },
            {
              onSuccess: () => {
                toast.success("موضوع اضافه شد");
                form.reset({ title: "" });
              },
              onError: (error) => toast.error(error.message),
            },
          ),
        )}
      >
        <Input placeholder="مثلاً دیواپس" {...form.register("title")} />
        <Button type="submit" disabled={save.isPending} className="shrink-0">
          <Plus className="size-3.5" />
          افزودن موضوع
        </Button>
      </form>

      <div className="divide-y divide-border rounded-xl border border-border">
        {isLoading ? <Skeleton className="h-24" /> : null}
        {!isLoading && data.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            هنوز موضوعی ثبت نشده.
          </p>
        ) : null}
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <p className="text-sm font-medium">{item.title}</p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() =>
                remove.mutate(item.id, {
                  onSuccess: () => toast.success("حذف شد"),
                  onError: (error) => toast.error(error.message),
                })
              }
            >
              <Trash2 className="size-3.5" />
              حذف
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorsPanel() {
  const { data = [], isLoading } = useSponsors();
  const save = useSaveSponsor();
  const remove = useDeleteSponsor();
  const form = useForm<SponsorInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", website: "https://", logo: "" },
  });

  return (
    <BrandCatalogPanel
      emptyLabel="هنوز حامیی ثبت نشده."
      isLoading={isLoading}
      items={data.map((item) => ({
        id: item.id,
        name: item.name,
        website: item.website,
        logo: item.logo,
      }))}
      pending={save.isPending}
      form={form}
      submitLabel="افزودن حامی"
      onSubmit={(values) =>
        save.mutate(
          { data: values },
          {
            onSuccess: () => {
              toast.success("حامی اضافه شد");
              form.reset({ name: "", website: "https://", logo: "" });
            },
            onError: (error) => toast.error(error.message),
          },
        )
      }
      onRemove={(id) =>
        remove.mutate(id, {
          onSuccess: () => toast.success("حذف شد"),
          onError: (error) => toast.error(error.message),
        })
      }
    />
  );
}

function PartnersPanel() {
  const { data = [], isLoading } = usePartners();
  const save = useSavePartner();
  const remove = useDeletePartner();
  const form = useForm<PartnerCompanyInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", website: "https://", logo: "" },
  });

  return (
    <BrandCatalogPanel
      emptyLabel="هنوز شریکی ثبت نشده."
      isLoading={isLoading}
      items={data.map((item) => ({
        id: item.id,
        name: item.name,
        website: item.website,
        logo: item.logo,
      }))}
      pending={save.isPending}
      form={form}
      submitLabel="افزودن شریک"
      onSubmit={(values) =>
        save.mutate(
          { data: values },
          {
            onSuccess: () => {
              toast.success("شریک اضافه شد");
              form.reset({ name: "", website: "https://", logo: "" });
            },
            onError: (error) => toast.error(error.message),
          },
        )
      }
      onRemove={(id) =>
        remove.mutate(id, {
          onSuccess: () => toast.success("حذف شد"),
          onError: (error) => toast.error(error.message),
        })
      }
    />
  );
}

function BrandCatalogPanel({
  form,
  items,
  isLoading,
  emptyLabel,
  submitLabel,
  pending,
  onSubmit,
  onRemove,
}: {
  form: ReturnType<typeof useForm<SponsorInput>>;
  items: { id: number; name: string; website: string; logo: string }[];
  isLoading: boolean;
  emptyLabel: string;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: SponsorInput) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="surface-panel space-y-4 p-4">
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-1.5">
          <Label>نام</Label>
          <Input {...form.register("name")} />
        </div>
        <div className="space-y-1.5">
          <Label>وب‌سایت</Label>
          <Input dir="ltr" {...form.register("website")} />
        </div>
        <div className="sm:col-span-2">
          <ImageDropField
            label="لوگو"
            value={form.watch("logo") || null}
            onChange={(next) =>
              form.setValue("logo", next ?? "", {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            <Plus className="size-3.5" />
            {submitLabel}
          </Button>
        </div>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? <Skeleton className="h-24 sm:col-span-2" /> : null}
        {!isLoading && items.length === 0 ? (
          <p className="sm:col-span-2 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : null}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {item.logo ? (
              <img
                src={item.logo}
                alt={item.name}
                className="size-10 rounded-lg object-contain bg-muted"
              />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-xs">
                —
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="truncate text-[11px] text-muted-foreground" dir="ltr">
                {item.website}
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
