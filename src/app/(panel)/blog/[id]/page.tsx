"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";

import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBlogCategories,
  useBlogPost,
  useModerateComment,
  useSaveBlog,
} from "@/lib/api/queries";
import { formatJalaliDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";

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
        <div className="surface-panel p-5 lg:col-span-3">
          <BlogPostForm
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
            onSubmit={(values) =>
              save.mutate(
                { id, data: values },
                {
                  onSuccess: () => toast.success("ذخیره شد"),
                  onError: (error) =>
                    toast.error(
                      error instanceof Error ? error.message : "ذخیره ممکن نشد",
                    ),
                },
              )
            }
          />
        </div>
        <div className="surface-panel space-y-3 p-5 lg:col-span-2">
          <h2 className="font-bold">کامنت‌ها</h2>
          {data.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">کامنتی نیست.</p>
          ) : null}
          {data.comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{comment.name}</p>
                <Badge variant={comment.approved ? "success" : "warning"}>
                  {comment.approved ? "تأییدشده" : "در انتظار"}
                </Badge>
              </div>
              <p className="mt-2 text-sm">{comment.text}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatJalaliDateTime(comment.createdAt)}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    moderate.mutate(
                      { postId: id, commentId: comment.id, approved: true },
                      {
                        onError: (error) =>
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "تأیید کامنت ممکن نشد",
                          ),
                      },
                    )
                  }
                >
                  تأیید
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    moderate.mutate(
                      { postId: id, commentId: comment.id, approved: false },
                      {
                        onError: (error) =>
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "رد کامنت ممکن نشد",
                          ),
                      },
                    )
                  }
                >
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
