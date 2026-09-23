"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { mockStore } from "@/lib/api/mock/store";
import { useInstructor, useSaveInstructor } from "@/lib/api/queries";
import type { InstructorInput } from "@/lib/api/types";
import { routes } from "@/lib/routes";

const schema = z.object({
  fullName: z.string().min(3),
  jobTitle: z.string().min(3),
  company: z.string().min(2),
  linkedinUrl: z.string().url(),
  bio: z.string().min(8),
});

export default function InstructorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = useInstructor(id);
  const save = useSaveInstructor();

  if (isLoading || !data) return <Skeleton className="h-96" />;

  const bootcamps = mockStore.listBootcamps().filter((item) => item.instructorIds.includes(id));

  return (
    <div className="space-y-6">
      <PageHeader backHref={routes.instructors} eyebrow={data.company ?? "مدرس"} title={data.fullName} description={data.jobTitle} />
      <div className="grid gap-4 lg:grid-cols-2">
        <InstructorEditForm initial={{
          fullName: data.fullName,
          jobTitle: data.jobTitle,
          company: data.company ?? "",
          linkedinUrl: data.linkedinUrl,
          bio: data.bio,
        }} submitting={save.isPending} onSave={(values) => save.mutate({ id, data: values }, { onSuccess: () => toast.success("ذخیره شد") })} />
        <div className="surface-panel p-5">
          <h2 className="mb-3 font-bold">بوت‌کمپ‌های مرتبط</h2>
          {bootcamps.length === 0 ? <p className="text-sm text-muted-foreground">هنوز وصل نشده.</p> : null}
          <ul className="space-y-2 text-sm">
            {bootcamps.map((item) => (
              <li key={item.id} className="rounded-xl border border-border px-3 py-2">
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function InstructorEditForm({
  initial,
  submitting,
  onSave,
}: {
  initial: InstructorInput;
  submitting: boolean;
  onSave: (values: InstructorInput) => void;
}) {
  const form = useForm<InstructorInput>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  return (
    <form className="surface-panel space-y-3 p-5" onSubmit={form.handleSubmit(onSave)}>
      <div className="space-y-1.5"><Label>نام</Label><Input {...form.register("fullName")} /></div>
      <div className="space-y-1.5"><Label>عنوان شغلی</Label><Input {...form.register("jobTitle")} /></div>
      <div className="space-y-1.5"><Label>شرکت</Label><Input {...form.register("company")} /></div>
      <div className="space-y-1.5"><Label>لینکدین</Label><Input dir="ltr" {...form.register("linkedinUrl")} /></div>
      <div className="space-y-1.5"><Label>بیو</Label><Textarea {...form.register("bio")} /></div>
      <Button type="submit" disabled={submitting}>ذخیره</Button>
    </form>
  );
}
