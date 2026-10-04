"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogCategories, useSaveBlog } from "@/lib/api/queries";
import { routes } from "@/lib/routes";

export default function NewBlogPostPage() {
  const router = useRouter();
  const categories = useBlogCategories();
  const save = useSaveBlog();

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={routes.blog}
        eyebrow="محتوا"
        title="پست جدید"
        description="عنوان، دسته و متن را وارد کنید و به‌صورت پیش‌نویس یا منتشرشده ذخیره کنید."
      />
      <div className="surface-panel p-5 md:p-7">
        {categories.isLoading ? (
          <Skeleton className="h-96" />
        ) : (
          <BlogPostForm
            categories={categories.data ?? []}
            submitting={save.isPending}
            submitLabel="ذخیره پیش‌نویس"
            onSubmit={(data) =>
              save.mutate(
                { data },
                {
                  onSuccess: (post) => {
                    toast.success("پست ساخته شد");
                    router.push(routes.blogPost(post.id));
                  },
                  onError: (error) =>
                    toast.error(
                      error instanceof Error ? error.message : "ثبت پست ممکن نشد",
                    ),
                },
              )
            }
          />
        )}
      </div>
    </div>
  );
}
