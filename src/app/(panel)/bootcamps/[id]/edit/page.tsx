"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { BootcampForm } from "@/components/bootcamps/BootcampForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useBootcamp, useUpdateBootcamp } from "@/lib/api/queries";
import { routes } from "@/lib/routes";

export default function EditBootcampPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { data, isLoading } = useBootcamp(id);
  const update = useUpdateBootcamp();

  if (isLoading || !data) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <PageHeader backHref={routes.bootcamp(id)} eyebrow="بوت‌کمپ" title={`ویرایش ${data.title}`} />
      <div className="surface-panel p-5">
        <BootcampForm
          initial={data}
          submitting={update.isPending}
          onSubmit={(values) =>
            update.mutate(
              { id, data: values },
              {
                onSuccess: () => {
                  toast.success("ذخیره شد");
                  router.push(routes.bootcamp(id));
                },
              },
            )
          }
        />
      </div>
    </div>
  );
}
