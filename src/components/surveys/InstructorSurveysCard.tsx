"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveys } from "@/lib/api/queries";
import { combineNps } from "@/lib/api/surveys.api";
import { toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

import { NpsBar, NpsValue, SurveyStatusBadge } from "./survey-meta";

export function InstructorSurveysCard({ instructorId }: { instructorId: number }) {
  const { data = [], isLoading } = useSurveys({ instructor: instructorId });
  const overall = combineNps(data.map((survey) => survey.nps));

  return (
    <div className="surface-panel space-y-4 p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">نظرسنجی‌ها و NPS</h2>
          <p className="text-xs text-muted-foreground">
            NPS کل از {toFa(overall.total)} امتیاز در {toFa(data.length)} نظرسنجی
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NpsValue nps={overall} className="text-2xl" />
          <Button asChild size="sm" variant="outline">
            <Link href={`${routes.surveyNew}?instructor=${instructorId}`}>
              <Plus className="size-4" /> نظرسنجی جدید
            </Link>
          </Button>
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-24" />
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز نظرسنجی‌ای برای این مدرس ساخته نشده.</p>
      ) : (
        <>
          <NpsBar nps={overall} />
          <ul className="space-y-2 text-sm">
            {data.map((survey) => (
              <li key={survey.id}>
                <Link
                  href={routes.survey(survey.id)}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 transition hover:border-brand-200"
                >
                  <span>
                    {survey.bootcampTitle} — {survey.bootcampSession}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {toFa(survey.responseCount)} پاسخ
                    </span>
                    <SurveyStatusBadge status={survey.status} isOpen={survey.isOpen} />
                    <NpsValue nps={survey.nps} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
