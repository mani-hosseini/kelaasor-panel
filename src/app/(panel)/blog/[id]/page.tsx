"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useBlogCategories, useBlogPost, useModerateComment, useSaveBlog } from "@/lib/api/queries";
import { BLOG_STATUS, type BlogPostInput } from "@/lib/api/types";
import { formatJalaliDateTime } from "@/lib/format";
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

export default function BlogPostPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = useBlogPost(id);
  const categories = useBlogCategories();
  const save = useSaveBlog();
  const moderate = useModerateComment();

  if (isLoading || !data) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <PageHeader backHref={routes.blog} eyebrow={data.categoryTitle} title={data.title} />
      <div className="grid gap-4 lg:grid-cols-5">
        <PostForm
          initial={{
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            categoryId: data.categoryId,
            status: data.status,
            banner: data.banner,
          }}
          categories={categories.data ?? []}
          submitting={save.isPending}
          onSave={(values) => save.mutate({ id, data: values }, { onSuccess: () => toast.success("ذخیره شد") })}
        />
        <div className="surface-panel space-y-3 p-5 lg:col-span-2">
          <h2 className="font-bold">کامنت‌ها</h2>
          {data.comments.length === 0 ? <p className="text-sm text-muted-foreground">کامنتی نیست.</p> : null}
          {data.comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{comment.name}</p>
                <Badge variant={comment.approved ? "success" : "warning"}>
                  {comment.approved ? "تأییدشده" : "در انتظار"}
                </Badge>
              </div>
              <p className="mt-2 text-sm">{comment.text}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatJalaliDateTime(comment.createdAt)}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => moderate.mutate({ postId: id, commentId: comment.id, approved: true })}>
                  تأیید
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => moderate.mutate({ postId: id, commentId: comment.id, approved: false })}>
                  رد
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostForm({
  initial,
  categories,
  submitting,
  onSave,
}: {
  initial: BlogPostInput;
  categories: { id: number; title: string }[];
  submitting: boolean;
  onSave: (values: BlogPostInput) => void;
}) {
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({ resolver: zodResolver(schema), defaultValues: initial });
  return (
    <form className="surface-panel space-y-3 p-5 lg:col-span-3" onSubmit={form.handleSubmit((values) => onSave(values))}>
      <Field label="عنوان"><Input {...form.register("title")} /></Field>
      <Field label="اسلاگ"><Input dir="ltr" {...form.register("slug")} /></Field>
      <Field label="دسته">
        <Select value={String(form.watch("categoryId"))} onValueChange={(v) => form.setValue("categoryId", Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>{item.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="وضعیت انتشار">
        <Select value={String(form.watch("status"))} onValueChange={(v) => form.setValue("status", Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={String(BLOG_STATUS.DRAFT)}>پیش‌نویس</SelectItem>
            <SelectItem value={String(BLOG_STATUS.PUBLISHED)}>انتشار</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="خلاصه"><Textarea {...form.register("excerpt")} /></Field>
      <Field label="بنر (URL)"><Input dir="ltr" {...form.register("banner")} /></Field>
      <Field label="متن"><Textarea rows={8} {...form.register("content")} /></Field>
      <Button type="submit" disabled={submitting}>ذخیره پست</Button>
    </form>
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
