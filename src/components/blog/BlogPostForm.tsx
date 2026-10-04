"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_STATUS, type BlogPostInput } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const blogPostSchema = z.object({
  title: z.string().min(4, "عنوان کوتاه است"),
  slug: z.string().min(3, "اسلاگ کوتاه است"),
  excerpt: z.string().min(8, "خلاصه کوتاه است"),
  content: z.string().min(12, "متن کوتاه است"),
  categoryId: z.coerce.number(),
  status: z.coerce.number(),
  banner: z.string(),
});

type BlogPostFormProps = {
  initial?: Partial<BlogPostInput>;
  categories: { id: number; title: string }[];
  submitting?: boolean;
  submitLabel?: string;
  className?: string;
  onSubmit: (values: BlogPostInput) => void;
};

const defaults: BlogPostInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  categoryId: 0,
  status: BLOG_STATUS.DRAFT,
  banner: "",
};

export function BlogPostForm({
  initial,
  categories,
  submitting = false,
  submitLabel = "ذخیره پست",
  className,
  onSubmit,
}: BlogPostFormProps) {
  const form = useForm<z.input<typeof blogPostSchema>, unknown, z.output<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      ...defaults,
      categoryId: categories[0]?.id ?? 0,
      ...initial,
    },
  });

  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="عنوان" error={form.formState.errors.title?.message}>
          <Input {...form.register("title")} />
        </Field>
        <Field label="اسلاگ" error={form.formState.errors.slug?.message}>
          <Input dir="ltr" className="text-left" {...form.register("slug")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="دسته">
          <Select
            value={String(form.watch("categoryId") || "")}
            onValueChange={(value) => form.setValue("categoryId", Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="انتخاب دسته" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="وضعیت انتشار">
          <Select
            value={String(form.watch("status"))}
            onValueChange={(value) => form.setValue("status", Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(BLOG_STATUS.DRAFT)}>پیش‌نویس</SelectItem>
              <SelectItem value={String(BLOG_STATUS.PUBLISHED)}>انتشار</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="بنر (URL)">
        <Input dir="ltr" className="text-left" {...form.register("banner")} />
      </Field>

      <Field label="خلاصه" error={form.formState.errors.excerpt?.message}>
        <Textarea rows={3} {...form.register("excerpt")} />
      </Field>

      <Field label="متن" error={form.formState.errors.content?.message}>
        <Textarea rows={10} {...form.register("content")} />
      </Field>

      <div className="flex justify-start">
        <Button type="submit" disabled={submitting}>
          {submitting ? "در حال ذخیره…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 text-right">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
