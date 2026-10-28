import type { SurveyQuestionReport, SurveyReport } from "@/lib/api/surveys.api";
import { formatJalaliDate, formatPercent, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

import { NpsBar, NpsValue } from "./survey-meta";

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="surface-panel p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function formatAverage(average: number | null, max: number) {
  if (average == null) return "—";
  return `${toFa(average)} از ${toFa(max)}`;
}

function scoreBarTone(score: number) {
  if (score >= 9) return "bg-success";
  if (score >= 7) return "bg-warning";
  return "bg-danger";
}

function QuestionReport({ question, index }: { question: SurveyQuestionReport; index: number }) {
  return (
    <section className="surface-panel space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold">
          <span className="text-brand">{toFa(index + 1)}.</span> {question.text}
        </h3>
        <span className="text-xs text-muted-foreground">{toFa(question.answerCount)} پاسخ</span>
      </div>

      {question.kind === "nps" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
            <span>
              NPS: <NpsValue nps={question.nps} className="text-lg" />
            </span>
            <span className="text-muted-foreground">
              میانگین امتیاز: {formatAverage(question.average, 10)}
            </span>
          </div>
          <NpsBar nps={question.nps} />
          <ScoreDistribution distribution={question.distribution} />
        </div>
      ) : null}

      {question.kind === "choice" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            میانگین: {formatAverage(question.average, question.maxScore)}
          </p>
          <ul className="space-y-2">
            {question.choices.map((choice) => (
              <li key={choice.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{choice.text}</span>
                  <span className="text-muted-foreground">
                    {toFa(choice.count)} نفر · {formatPercent(choice.percent)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${choice.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {question.kind === "text" ? (
        question.answers.length ? (
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
            {question.answers.map((answer, i) => (
              <li key={i} className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                <p className="whitespace-pre-wrap leading-7">{answer.text}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatJalaliDate(answer.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">پاسخ تشریحی ثبت نشده.</p>
        )
      ) : null}
    </section>
  );
}

function ScoreDistribution({ distribution }: { distribution: { score: number; count: number }[] }) {
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div dir="ltr" className="grid grid-cols-11 items-end gap-1.5">
      {distribution.map((item) => (
        <div key={item.score} className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-muted-foreground">{item.count ? toFa(item.count) : ""}</span>
          <div className="flex h-24 w-full items-end rounded-md bg-muted/60">
            <div
              className={cn("w-full rounded-md", scoreBarTone(item.score))}
              style={{ height: `${(item.count * 100) / max}%` }}
            />
          </div>
          <span className="text-xs font-medium">{toFa(item.score)}</span>
        </div>
      ))}
    </div>
  );
}

export function SurveyReportView({ report }: { report: SurveyReport }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="NPS نظرسنجی"
          value={<NpsValue nps={report.nps} />}
          hint="درصد مروج‌ها منهای درصد منتقدها (از −۱۰۰ تا +۱۰۰)"
        />
        <Stat
          label="پاسخ‌ها"
          value={<span className="font-bold">{toFa(report.responseCount)}</span>}
          hint={`از ${toFa(report.invitedCount)} دانشجوی دعوت‌شده`}
        />
        <Stat
          label="نرخ مشارکت"
          value={<span className="font-bold">{formatPercent(report.responseRate)}</span>}
          hint="پاسخ‌ها ناشناس ثبت می‌شوند"
        />
      </div>
      <div className="surface-panel p-5">
        <NpsBar nps={report.nps} />
      </div>
      {report.questions.map((question, index) => (
        <QuestionReport key={question.id} question={question} index={index} />
      ))}
    </div>
  );
}
