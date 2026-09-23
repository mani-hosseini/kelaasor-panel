"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BootcampForm } from "@/components/bootcamps/BootcampForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCreateBootcamp } from "@/lib/api/queries";
import { routes } from "@/lib/routes";

export default function NewBootcampPage() {
  const router = useRouter();
  const create = useCreateBootcamp();

  return (
    <div className="space-y-6">
      <PageHeader backHref={routes.bootcamps} eyebrow="بوت‌کمپ" title="بوت‌کمپ جدید" />
      <div className="surface-panel p-5">
        <BootcampForm
          submitting={create.isPending}
          onSubmit={(data) =>
            create.mutate(data, {
              onSuccess: (bootcamp) => {
                toast.success("بوت‌کمپ ساخته شد");
                router.push(routes.bootcamp(bootcamp.id));
              },
            })
          }
        />
      </div>
    </div>
  );
}
