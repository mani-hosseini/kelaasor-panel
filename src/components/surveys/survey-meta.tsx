import { Badge } from "@/components/ui/badge";
import {
  SURVEY_STATUS,
  type NpsBreakdown,
  type SurveyQuestionKind,
  type SurveyStatus,
} from "@/lib/api/surveys.api";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

export const surveyStatusMeta: Record<
  SurveyStatus,
  { label: string; variant: "secondary" | "success" | "outline" }
> = {
  [SURVEY_STATUS.DRAFT]: { label: "پیش‌نویس", variant: "secondary" },
  [SURVEY_STATUS.ACTIVE]: { label: "فعال", variant: "success" },
  [SURVEY_STATUS.CLOSED]: { label: "بسته‌شده", variant: "outline" },
};

export const questionKindLabels: Record<SurveyQuestionKind, string> = {
  nps: "امتیاز ۰ تا ۱۰ (NPS)",
  choice: "چندگزینه‌ای",
  text: "تشریحی",
};

export function SurveyStatusBadge({ status, isOpen }: { status: SurveyStatus; isOpen?: boolean }) {
  // An active survey past its deadline no longer accepts responses.
  if (status === SURVEY_STATUS.ACTIVE && isOpen === false) {
    return <Badge variant="warning">مهلت تمام شده</Badge>;
  }
  const meta = surveyStatusMeta[status] ?? surveyStatusMeta[SURVEY_STATUS.DRAFT];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

/** NPS ranges from −100 to +100; color by the usual bands. */
export function npsTone(score: number | null) {
  if (score == null) return "text-muted-foreground";
  if (score >= 50) return "text-success";
  if (score >= 0) return "text-warning";
  return "text-danger";
}

export function formatNps(score: number | null) {
  if (score == null) return "—";
  return score > 0 ? `+${toFa(score)}` : score < 0 ? `−${toFa(-score)}` : toFa(0);
}

export function NpsValue({ nps, className }: { nps: NpsBreakdown; className?: string }) {
  return (
    <span dir="ltr" className={cn("font-bold tabular-nums", npsTone(nps.score), className)}>
      {formatNps(nps.score)}
    </span>
  );
}

/** Stacked promoters / passives / detractors bar. */
export function NpsBar({ nps }: { nps: NpsBreakdown }) {
  if (!nps.total) {
    return <p className="text-xs text-muted-foreground">هنوز امتیازی ثبت نشده.</p>;
  }
  const segments = [
    { label: "مروج (۹–۱۰)", value: nps.promoters, className: "bg-success" },
    { label: "خنثی (۷–۸)", value: nps.passives, className: "bg-warning" },
    { label: "منتقد (۰–۶)", value: nps.detractors, className: "bg-danger" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        {segments.map((segment) =>
          segment.value ? (
            <div
              key={segment.label}
              className={segment.className}
              style={{ width: `${(segment.value * 100) / nps.total}%` }}
            />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((segment) => (
          <span key={segment.label} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", segment.className)} />
            {segment.label}: {toFa(segment.value)}
          </span>
        ))}
      </div>
    </div>
  );
}
