"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateEnrollmentStatus } from "@/lib/api/queries";
import { ENROLLMENT_STATUS, type EnrollmentStatus } from "@/lib/api/types";

export const STAGE_ACTIONS: {
  label: string;
  status: EnrollmentStatus;
  destructive?: boolean;
  askNote?: boolean;
}[] = [
  { label: "منتظر تماس مشاور", status: ENROLLMENT_STATUS.THINKING, askNote: true },
  { label: "تماس بی‌پاسخ", status: ENROLLMENT_STATUS.NO_ANSWER, askNote: true },
  { label: "تماس انجام شد → تکمیل اطلاعات", status: ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION },
  { label: "منتظر فیش پرداخت", status: ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT },
  { label: "ارسال به تأیید پرداخت", status: ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION },
  { label: "تأیید نهایی ثبت‌نام", status: ENROLLMENT_STATUS.CONFIRMED },
  { label: "لغو ثبت‌نام", status: ENROLLMENT_STATUS.CANCELED, destructive: true, askNote: true },
];

export function StageActions({
  enrollmentId,
  currentStatus,
  columns = 1,
}: {
  enrollmentId: number;
  currentStatus: EnrollmentStatus;
  columns?: 1 | 2;
}) {
  const updateStatus = useUpdateEnrollmentStatus();
  const [pending, setPending] = useState<(typeof STAGE_ACTIONS)[number] | null>(null);
  const [note, setNote] = useState("");

  function apply(action: (typeof STAGE_ACTIONS)[number], notes?: string) {
    updateStatus.mutate(
      { id: enrollmentId, status: action.status, notes },
      {
        onSuccess: () => {
          toast.success("مرحله ثبت‌نام به‌روز شد");
          setPending(null);
          setNote("");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <div className="space-y-3">
      <div className={columns === 2 ? "grid gap-2 sm:grid-cols-2" : "grid gap-2"}>
        {STAGE_ACTIONS.map((action) => (
          <Button
            key={action.status}
            variant={action.destructive ? "destructive" : "outline"}
            className="w-full justify-start"
            disabled={updateStatus.isPending || currentStatus === action.status}
            onClick={() => {
              if (action.askNote) {
                setPending(action);
                return;
              }
              apply(action);
            }}
          >
            {action.label}
          </Button>
        ))}
      </div>
      {pending ? (
        <div className="space-y-2 rounded-2xl border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium">یادداشت برای «{pending.label}» (اختیاری)</p>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="دلیل تماس بی‌پاسخ، لغو، یا نکته مشاور…"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() => apply(pending, note.trim() || undefined)}
            >
              تأیید مرحله
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
              انصراف
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
