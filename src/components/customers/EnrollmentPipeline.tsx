import { enrollmentStatusMeta } from "@/lib/api/mock/seed";
import {
  ENROLLMENT_PIPELINE,
  ENROLLMENT_STATUS,
  type EnrollmentStatus,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

type EnrollmentPipelineProps = {
  currentStatus: EnrollmentStatus;
  className?: string;
};

export function EnrollmentPipeline({ currentStatus, className }: EnrollmentPipelineProps) {
  const currentIndex = ENROLLMENT_PIPELINE.indexOf(currentStatus);
  const isCanceled = currentStatus === ENROLLMENT_STATUS.CANCELED;

  return (
    <div className={cn("space-y-3", className)}>
      {isCanceled ? (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          این ثبت‌نام لغو شده است.
        </p>
      ) : null}
      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {ENROLLMENT_PIPELINE.map((status, index) => {
          const meta = enrollmentStatusMeta[status];
          const done = !isCanceled && currentIndex >= 0 && index < currentIndex;
          const active = !isCanceled && status === currentStatus;
          return (
            <li
              key={status}
              className={cn(
                "rounded-2xl border px-3 py-3 transition",
                active && "border-brand bg-brand/8 shadow-sm",
                done && "border-brand/30 bg-brand/5",
                !active && !done && "border-border bg-card",
              )}
            >
              <p className="text-[11px] text-muted-foreground">مرحله {index + 1}</p>
              <p className={cn("mt-1 text-sm font-semibold", active && "text-brand")}>
                {meta.label}
              </p>
              {active ? (
                <p className="mt-1 text-[11px] font-medium text-brand">وضعیت فعلی</p>
              ) : done ? (
                <p className="mt-1 text-[11px] text-muted-foreground">عبور کرده</p>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground">بعدی</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
