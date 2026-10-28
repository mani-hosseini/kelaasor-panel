"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { QueryErrorPanel } from "@/components/surveys/QueryErrorPanel";
import { NpsValue, SurveyStatusBadge, surveyStatusMeta } from "@/components/surveys/survey-meta";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveys } from "@/lib/api/queries";
import { SURVEY_STATUS, type SurveyListItem, type SurveyStatus } from "@/lib/api/surveys.api";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function SurveysPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { data = [], isLoading, isError, error, refetch } = useSurveys({
    search,
    status: status === "all" ? undefined : (Number(status) as SurveyStatus),
  });

  const columns = useMemo<ColumnDef<SurveyListItem>[]>(
    () => [
      {
        header: "نظرسنجی",
        cell: ({ row }) => (
          <Link href={routes.survey(row.original.id)} className="font-medium hover:text-brand">
            {row.original.title}
          </Link>
        ),
      },
      {
        header: "بوت‌کمپ",
        cell: ({ row }) => (
          <div>
            <p>{row.original.bootcampTitle}</p>
            <p className="text-xs text-muted-foreground">{row.original.bootcampSession}</p>
          </div>
        ),
      },
      {
        header: "مدرس",
        cell: ({ row }) => (
          <Link href={routes.instructor(row.original.instructorId)} className="hover:text-brand">
            {row.original.instructorName}
          </Link>
        ),
      },
      {
        header: "وضعیت",
        cell: ({ row }) => <SurveyStatusBadge status={row.original.status} isOpen={row.original.isOpen} />,
      },
      {
        header: "پاسخ‌ها",
        cell: ({ row }) => `${toFa(row.original.responseCount)} / ${toFa(row.original.invitedCount)}`,
      },
      {
        header: "NPS",
        cell: ({ row }) => <NpsValue nps={row.original.nps} />,
      },
      {
        header: "ارسال",
        cell: ({ row }) => formatJalaliDate(row.original.activatedAt),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link href={routes.survey(row.original.id)}>
              {row.original.status === SURVEY_STATUS.DRAFT ? "ویرایش و ارسال" : "گزارش"}
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="آموزش"
        title="نظرسنجی مدرس‌ها"
        description={`${toFa(data.length)} نظرسنجی — بعد از پایان تدریس هر مدرس، نظرسنجی بسازید و برای دانشجویان آن دوره پیامک کنید.`}
        actions={
          <Button asChild size="sm">
            <Link href={routes.surveyNew}>
              <Plus className="size-4" /> نظرسنجی جدید
            </Link>
          </Button>
        }
      />
      {isError ? <QueryErrorPanel error={error} onRetry={() => void refetch()} /> : null}
      <div className="surface-panel p-5">
        {isLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="عنوان، بوت‌کمپ یا مدرس…"
            empty="هنوز نظرسنجی‌ای ساخته نشده."
            toolbar={
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  {Object.entries(surveyStatusMeta).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        )}
      </div>
    </div>
  );
}
