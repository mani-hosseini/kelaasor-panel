"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { QueryErrorPanel } from "@/components/surveys/QueryErrorPanel";
import { SurveyForm } from "@/components/surveys/SurveyForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaveSurvey, useSurveyFormOptions } from "@/lib/api/queries";
import { routes } from "@/lib/routes";

export default function NewSurveyPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <NewSurveyContent />
    </Suspense>
  );
}

function NewSurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = useSurveyFormOptions();
  const save = useSaveSurvey();
  const presetInstructor = Number(searchParams.get("instructor")) || null;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        backHref={routes.surveys}
        eyebrow="نظرسنجی‌ها"
        title="نظرسنجی جدید"
        description="نظرسنجی ابتدا به‌صورت پیش‌نویس ذخیره می‌شود؛ بعد از بررسی، از صفحه آن «ارسال» را بزنید تا پیامک برای دانشجویان برود."
      />
      {options.isError ? (
        <QueryErrorPanel error={options.error} onRetry={() => void options.refetch()} />
      ) : options.isLoading || !options.data ? (
        <Skeleton className="h-96" />
      ) : (
        <SurveyForm
          events={options.data.events}
          initial={{
            bootcampEventId:
              options.data.events.find((event) =>
                event.instructors.some((i) => i.id === presetInstructor),
              )?.id ?? null,
            instructorId: presetInstructor,
            title: "",
            description: "",
            closesAt: null,
            questions: options.data.defaultQuestions,
          }}
          submitting={save.isPending}
          submitLabel="ذخیره پیش‌نویس"
          onSubmit={(data) =>
            save.mutate(
              { data },
              {
                onSuccess: (survey) => {
                  toast.success("پیش‌نویس نظرسنجی ذخیره شد");
                  router.replace(routes.survey(survey.id));
                },
                onError: (error) => toast.error(error.message),
              },
            )
          }
        />
      )}
    </div>
  );
}
