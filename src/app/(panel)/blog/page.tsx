"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useBlog, useBlogCategories, useDeleteBlog, useSaveBlog } from "@/lib/api/queries";
import { BLOG_STATUS, type BlogPost, type BlogPostInput } from "@/lib/api/types";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

const schema = z.object({
  title: z.string().min(4),
  slug: z.string().min(3),
  excerpt: z.string().min(8),
  content: z.string().min(12),
  categoryId: z.coerce.number(),
  status: z.coerce.number(),
  banner: z.string(),
});

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useBlog({ search });
  const categories = useBlogCategories();
  const save = useSaveBlog();
  const remove = useDeleteBlog();
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      categoryId: 1,
      status: BLOG_STATUS.DRAFT,
      banner: "",
    },
  });

  const columns = useMemo<ColumnDef<BlogPost>[]>(
    () => [
      {
        header: "پست",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.categoryTitle}</p>
          </div>
        ),
      },
      {
        header: "وضعیت",
        cell: ({ row }) => (
          <Badge variant={row.original.status === BLOG_STATUS.PUBLISHED ? "success" : "secondary"}>
            {row.original.status === BLOG_STATUS.PUBLISHED ? "منتشرشده" : "پیش‌نویس"}
          </Badge>
        ),
      },
      { header: "بازدید", cell: ({ row }) => toFa(row.original.viewCount) },
      { header: "کامنت", cell: ({ row }) => toFa(row.original.comments.length) },
      { header: "تاریخ", cell: ({ row }) => formatJalaliDate(row.original.publishedAt ?? row.original.createdAt) },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={routes.blogPost(row.original.id)}>ویرایش</Link>
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(row.original.id, { onSuccess: () => toast.success("حذف شد") })}>
              حذف
            </Button>
          </div>
        ),
      },
    ],
    [remove],
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="محتوا" title="بلاگ کلاسور" actions={<Button onClick={() => setOpen(true)}>پست جدید</Button>} />
      <div className="surface-panel p-5">
        {isLoading ? <Skeleton className="h-80" /> : (
          <DataTable columns={columns} data={data} searchValue={search} onSearchChange={setSearch} />
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>پست جدید</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((values) =>
              save.mutate(
                { data: values },
                {
                  onSuccess: () => {
                    toast.success("ساخته شد");
                    setOpen(false);
                    form.reset();
                  },
                },
              ),
            )}
          >
            <Field label="عنوان"><Input {...form.register("title")} /></Field>
            <Field label="اسلاگ"><Input dir="ltr" {...form.register("slug")} /></Field>
            <Field label="دسته">
              <Select value={String(form.watch("categoryId"))} onValueChange={(v) => form.setValue("categoryId", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(categories.data ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>{item.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="بنر (URL)"><Input dir="ltr" {...form.register("banner")} /></Field>
            <Field label="خلاصه"><Textarea {...form.register("excerpt")} /></Field>
            <Field label="متن"><Textarea rows={5} {...form.register("content")} /></Field>
            <Button type="submit" disabled={save.isPending}>ذخیره پیش‌نویس</Button>
          </form>
        </DialogContent>
      </Dialog>
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
