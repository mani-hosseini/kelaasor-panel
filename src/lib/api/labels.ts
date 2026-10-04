import {
  CALL_OUTCOME,
  ENROLLMENT_STATUS,
  type CallOutcome,
  type EnrollmentStatus,
} from "@/lib/api/types";

/**
 * Fallback UI labels when the backend does not send `*_display` fields.
 * Prefer API display strings in real modules; use these only as fallback.
 */
export const enrollmentStatusMeta: Record<
  number,
  { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  [ENROLLMENT_STATUS.CANCELED]: { label: "لغو شده", tone: "danger" },
  [ENROLLMENT_STATUS.INITIAL]: { label: "پیش‌ثبت‌نام", tone: "neutral" },
  [ENROLLMENT_STATUS.THINKING]: { label: "منتظر تماس مشاور", tone: "info" },
  [ENROLLMENT_STATUS.NO_ANSWER]: { label: "تماس بی‌پاسخ", tone: "warning" },
  [ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION]: {
    label: "تکمیل اطلاعات",
    tone: "warning",
  },
  [ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT]: {
    label: "منتظر فیش",
    tone: "warning",
  },
  [ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION]: {
    label: "تأیید پرداخت",
    tone: "warning",
  },
  [ENROLLMENT_STATUS.CONFIRMED]: { label: "تأیید نهایی", tone: "success" },
};

export function enrollmentStatusLabel(
  status: EnrollmentStatus | number,
  display?: string | null,
) {
  if (display?.trim()) return display.trim();
  return enrollmentStatusMeta[status]?.label ?? "نامشخص";
}

export const callOutcomeLabels: Record<CallOutcome | string, string> = {
  [CALL_OUTCOME.ANSWERED]: "پاسخ داد",
  [CALL_OUTCOME.NO_ANSWER]: "بی‌پاسخ",
  [CALL_OUTCOME.CALLBACK]: "درخواست تماس مجدد",
  [CALL_OUTCOME.BUSY]: "خط مشغول",
};

export function callOutcomeLabel(outcome: string, display?: string | null) {
  if (display?.trim()) return display.trim();
  return callOutcomeLabels[outcome] ?? outcome;
}

export const educationLevels: Record<number, string> = {
  1: "دیپلم",
  2: "کاردانی",
  3: "کارشناسی",
  4: "کارشناسی ارشد",
  5: "دکتری",
};

export function educationLevelLabel(
  level: number | null | undefined,
  display?: string | null,
) {
  if (display?.trim()) return display.trim();
  if (level == null) return "—";
  return educationLevels[level] ?? "—";
}
