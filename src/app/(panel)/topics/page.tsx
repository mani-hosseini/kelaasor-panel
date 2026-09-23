"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteTopic, useSaveTopic, useTopics } from "@/lib/api/queries";

const schema = z.object({ title: z.string().min(2, "عنوان لازم است.") });

export default function TopicsPage() {
  const { data = [], isLoading } = useTopics();
  const save = useSaveTopic();
  const remove = useDeleteTopic();
  const [editingId, setEditingId] = useState<number | null>(null);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { title: "" } });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="محتوا" title="موضوع‌های بوت‌کمپ" description="دسته‌بندی‌هایی که سایت عمومی کلاسور با آن‌ها فیلتر می‌شود." />
      <form
        className="surface-panel flex flex-col gap-3 p-5 sm:flex-row"
        onSubmit={form.handleSubmit((values) =>
          save.mutate(
            { id: editingId ?? undefined, data: values },
            {
              onSuccess: () => {
                toast.success(editingId ? "ویرایش شد" : "اضافه شد");
                setEditingId(null);
                form.reset({ title: "" });
              },
            },
          ),
        )}
      >
        <Input placeholder="مثلاً دیواپس" {...form.register("title")} />
        <Button type="submit" disabled={save.isPending}>
          {editingId ? "ذخیره ویرایش" : "افزودن موضوع"}
        </Button>
      </form>
      <div className="surface-panel divide-y divide-border">
        {isLoading ? <Skeleton className="h-40" /> : null}
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <p className="font-medium">{item.title}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingId(item.id);
                  form.reset({ title: item.title });
                }}
              >
                ویرایش
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(item.id)}>
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
