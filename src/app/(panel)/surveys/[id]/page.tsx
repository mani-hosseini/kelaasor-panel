"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Send } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { QueryErrorPanel } from "@/components/surveys/QueryErrorPanel";
import { SurveyForm } from "@/components/surveys/SurveyForm";
import { SurveyReportView } from "@/components/surveys/SurveyReportView";
import { SurveyStatusBadge, questionKindLabels } from "@/components/surveys/survey-meta";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { JalaliDateTimePicker } from "@/components/ui/JalaliDateTimePicker";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSaveSurvey,
  useSurvey,
  useSurveyAction,
  useSurveyFormOptions,
  useSurveyReport,
  useUpdateSurvey,
} from "@/lib/api/queries";
import { SURVEY_STATUS, type SurveyDetail } from "@/lib/api/surveys.api";
import { formatJalaliDateTime, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

type ConfirmKind = "activate" | "close" | "remove";

const confirmCopy: Record<ConfirmKind, { title: string; action: string; success: string }> = {
  activate: { title: "ارسال نظرسنجی", action: "ارسال پیامک", success: "نظرسنجی فعال شد و پیامک‌ها در صف ارسال قرار گرفتند" },
  close: { title: "بستن نظرسنجی", action: "بستن", success: "نظرسنجی بسته شد" },
  remove: { title: "حذف نظرسنجی", action: "حذف", success: "نظرسنجی حذف شد" },
};

export default function SurveyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const { data: survey, isLoading, isError, error, refetch } = useSurvey(id);
  const runAction = useSurveyAction();
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [editing, setEditing] = useState(false);

  if (isError) return <QueryErrorPanel error={error} onRetry={() => void refetch()} />;
  if (isLoading || !survey) return <Skeleton className="h-96" />;

  const isDraft = survey.status === SURVEY_STATUS.DRAFT;

  const confirmDescription: Record<ConfirmKind, string> = {
    activate: `پیامک دعوت برای ${toFa(survey.invitedCount)} دانشجوی ثبت‌نام‌نهایی‌شده «${survey.bootcampTitle} — ${survey.bootcampSession}» ارسال می‌شود. بعد از ارسال، دوره و مدرس قابل تغییر نیستند و پس از اولین پاسخ فقط متن سوال‌ها قابل ویرایش است.`,
    close: "بعد از بستن، دانشجویان دیگر نمی‌توانند پاسخ ثبت کنند. گزارش همچنان در دسترس است.",
    remove: "این نظرسنجی و سوالاتش برای همیشه حذف می‌شوند.",
  };

  const run = (kind: ConfirmKind) =>
    runAction.mutate(
      { id, action: kind },
      {
        onSuccess: () => {
          toast.success(confirmCopy[kind].success);
          setConfirm(null);
          if (kind === "remove") router.replace(routes.surveys);
        },
        onError: (error) => toast.error(error.message),
      },
    );

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        backHref={routes.surveys}
        eyebrow={`${survey.bootcampTitle} — ${survey.bootcampSession}`}
        title={survey.title}
        description={`مدرس: ${survey.instructorName}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SurveyStatusBadge status={survey.status} isOpen={survey.isOpen} />
            {isDraft ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setConfirm("remove")}>
                  حذف
                </Button>
                <Button size="sm" onClick={() => setConfirm("activate")}>
                  <Send className="size-4" /> ارسال برای دانشجویان
                </Button>
              </>
            ) : null}
            {!isDraft && !editing ? (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="size-4" /> ویرایش
              </Button>
            ) : null}
            {survey.status === SURVEY_STATUS.ACTIVE ? (
              <Button size="sm" variant="outline" onClick={() => setConfirm("close")}>
                بستن نظرسنجی
              </Button>
            ) : null}
            {!isDraft && survey.responseCount === 0 ? (
              <Button size="sm" variant="ghost" onClick={() => setConfirm("remove")}>
                حذف
              </Button>
            ) : null}
          </div>
        }
      />

      {isDraft ? (
        <SurveyEditor survey={survey} />
      ) : editing ? (
        <SurveyEditor survey={survey} onDone={() => setEditing(false)} />
      ) : (
        <SentSurvey survey={survey} />
      )}

      <AlertDialog open={confirm != null} onOpenChange={(open) => !open && setConfirm(null)}>
        {confirm ? (
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmCopy[confirm].title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDescription[confirm]}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                disabled={runAction.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  run(confirm);
                }}
              >
                {confirmCopy[confirm].action}
              </AlertDialogAction>
              <AlertDialogCancel>انصراف</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  );
}

/** Drafts edit everything; sent surveys (`onDone` given) keep their audience,
 * and once answered only their wording (enforced by the backend too). */
function SurveyEditor({ survey, onDone }: { survey: SurveyDetail; onDone?: () => void }) {
  const isSent = survey.status !== SURVEY_STATUS.DRAFT;
  const options = useSurveyFormOptions();
  const save = useSaveSurvey();

  if (options.isError) {
    return <QueryErrorPanel error={options.error} onRetry={() => void options.refetch()} />;
  }
  if (options.isLoading || !options.data) return <Skeleton className="h-96" />;

  return (
    <SurveyForm
      key={survey.id}
      events={options.data.events}
      initial={{
        bootcampEventId: survey.bootcampEventId,
        instructorId: survey.instructorId,
        title: survey.rawTitle,
        description: survey.description,
        closesAt: survey.closesAt,
        questions: survey.questions,
      }}
      submitting={save.isPending}
      submitLabel="ذخیره تغییرات"
      lockAudience={isSent}
      lockStructure={isSent && survey.responseCount > 0}
      onCancel={onDone}
      onSubmit={(data) =>
        save.mutate(
          { id: survey.id, data },
          {
            onSuccess: () => {
              toast.success("ذخیره شد");
              onDone?.();
            },
            onError: (error) => toast.error(error.message),
          },
        )
      }
    />
  );
}

function SentSurvey({ survey }: { survey: SurveyDetail }) {
  const report = useSurveyReport(survey.id);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        {report.isError ? (
          <QueryErrorPanel error={report.error} onRetry={() => void report.refetch()} />
        ) : report.isLoading || !report.data ? (
          <Skeleton className="h-96" />
        ) : (
          <SurveyReportView report={report.data} />
        )}
      </div>
      <aside className="space-y-4">
        <DeadlineCard survey={survey} />
        <div className="surface-panel space-y-2 p-5 text-sm">
          <h2 className="font-bold">جزئیات</h2>
          <p className="text-muted-foreground">ارسال: {formatJalaliDateTime(survey.activatedAt)}</p>
          <p className="text-muted-foreground">دعوت‌شده‌ها: {toFa(survey.invitedCount)} نفر</p>
          <h3 className="pt-2 font-semibold">سوالات</h3>
          <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
            {survey.questions.map((question) => (
              <li key={question.id}>
                {question.text}{" "}
                <span className="text-[11px]">({questionKindLabels[question.kind]})</span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

function DeadlineCard({ survey }: { survey: SurveyDetail }) {
  const update = useUpdateSurvey();
  const [value, setValue] = useState<string | null>(null);

  if (survey.status !== SURVEY_STATUS.ACTIVE) {
    return (
      <div className="surface-panel p-5 text-sm">
        <h2 className="font-bold">مهلت پاسخ</h2>
        <p className="mt-2 text-muted-foreground">نظرسنجی بسته شده است.</p>
      </div>
    );
  }

  return (
    <div className="surface-panel space-y-3 p-5 text-sm">
      <h2 className="font-bold">مهلت پاسخ</h2>
      <p className="text-muted-foreground">
        {survey.closesAt ? `تا ${formatJalaliDateTime(survey.closesAt)}` : "بدون مهلت"}
      </p>
      <div className="space-y-1.5">
        <Label>تغییر مهلت</Label>
        <JalaliDateTimePicker value={value} onChange={setValue} placeholder="انتخاب مهلت جدید" />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!value || update.isPending}
          onClick={() =>
            update.mutate(
              { id: survey.id, data: { closesAt: value } },
              {
                onSuccess: () => {
                  toast.success("مهلت به‌روزرسانی شد");
                  setValue(null);
                },
                onError: (error) => toast.error(error.message),
              },
            )
          }
        >
          ذخیره
        </Button>
        {survey.closesAt ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={update.isPending}
            onClick={() =>
              update.mutate(
                { id: survey.id, data: { closesAt: null } },
                { onSuccess: () => toast.success("مهلت حذف شد"), onError: (error) => toast.error(error.message) },
              )
            }
          >
            حذف مهلت
          </Button>
        ) : null}
      </div>
    </div>
  );
}
