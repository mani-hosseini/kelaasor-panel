import type { AdminTask } from "@/lib/api/tasks.api";
import {
  ENROLLMENT_STATUS,
  NEXT_STEP_BY,
  type CustomerListItem,
  type Enrollment,
  type Payment,
} from "@/lib/api/types";
import { routes } from "@/lib/routes";

export type TaskSource = "manual" | "followup" | "call" | "payment" | "enrollment";

export type TaskBoardItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
  done: boolean;
  source: TaskSource;
  /** Numeric id for persisted manual tasks only */
  numericId?: number;
  priority: number;
  createdAt?: string;
};

export const taskSourceMeta: Record<
  TaskSource,
  { label: string; tone: "default" | "warning" | "orange" | "info" | "success" | "secondary" }
> = {
  manual: { label: "دستی", tone: "default" },
  followup: { label: "پیگیری", tone: "orange" },
  call: { label: "تماس ناقص", tone: "warning" },
  payment: { label: "تأیید فیش", tone: "info" },
  enrollment: { label: "ثبت‌نام", tone: "secondary" },
};

function paymentAwaiting(payment: Payment) {
  return (
    (!payment.verified && Boolean(payment.receipt)) ||
    payment.installments.some((row) => row.awaitingVerification)
  );
}

function customerName(item: Pick<CustomerListItem, "firstName" | "lastName">) {
  return `${item.firstName} ${item.lastName}`.trim() || "مشتری";
}

/** Build system tasks from CRM queues (missed calls, follow-ups, pay verify, admin next step). */
export function deriveSystemTasks(input: {
  customers: CustomerListItem[];
  enrollments: Enrollment[];
  payments: Payment[];
  userName: (userId: number) => string;
  dismissedIds: Set<string>;
}): TaskBoardItem[] {
  const { customers, enrollments, payments, userName, dismissedIds } = input;
  const items: TaskBoardItem[] = [];
  const customerById = new Map(customers.map((item) => [item.id, item]));

  for (const customer of customers) {
    if (customer.followUpState === "overdue" || customer.followUpState === "today") {
      const id = `sys-fu-${customer.id}`;
      if (!dismissedIds.has(id)) {
        items.push({
          id,
          title: `پیگیری ${customerName(customer)}`,
          meta:
            customer.followUpState === "overdue"
              ? "یادآوری از موعد گذشته"
              : "یادآوری امروز",
          href: routes.customer(customer.id),
          done: false,
          source: "followup",
          priority: customer.followUpState === "overdue" ? 0 : 1,
        });
      }
    }
  }

  for (const enrollment of enrollments) {
    if (
      enrollment.status === ENROLLMENT_STATUS.CONFIRMED ||
      enrollment.status === ENROLLMENT_STATUS.CANCELED
    ) {
      continue;
    }

    const customer = customerById.get(enrollment.userId);
    const name = customer ? customerName(customer) : userName(enrollment.userId) || "مشتری";

    if (
      enrollment.status === ENROLLMENT_STATUS.NO_ANSWER ||
      enrollment.status === ENROLLMENT_STATUS.THINKING
    ) {
      const id = `sys-call-${enrollment.id}`;
      if (!dismissedIds.has(id)) {
        items.push({
          id,
          title: `تماس ناقص — ${name}`,
          meta: enrollment.statusLabel || "منتظر تماس مشاور",
          href: routes.enrollment(enrollment.id),
          done: false,
          source: "call",
          priority: enrollment.status === ENROLLMENT_STATUS.NO_ANSWER ? 0 : 2,
        });
      }
      continue;
    }

    if (enrollment.status === ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION) {
      const id = `sys-pay-enr-${enrollment.id}`;
      if (!dismissedIds.has(id)) {
        items.push({
          id,
          title: `تأیید فیش — ${name}`,
          meta: "ثبت‌نام منتظر تأیید پرداخت",
          href: enrollment.paymentId
            ? routes.payment(enrollment.paymentId)
            : routes.enrollment(enrollment.id),
          done: false,
          source: "payment",
          priority: 1,
        });
      }
      continue;
    }

    if (enrollment.nextStepBy === NEXT_STEP_BY.ADMIN) {
      const id = `sys-enr-${enrollment.id}`;
      if (!dismissedIds.has(id)) {
        items.push({
          id,
          title: `اقدام ثبت‌نام — ${name}`,
          meta: enrollment.statusLabel || "نوبت ادمین",
          href: routes.enrollment(enrollment.id),
          done: false,
          source: "enrollment",
          priority: 3,
        });
      }
    }
  }

  for (const payment of payments) {
    if (!paymentAwaiting(payment)) continue;
    const id = `sys-pay-${payment.id}`;
    if (dismissedIds.has(id)) continue;
    // Skip if already covered by enrollment verification task
    if (
      items.some(
        (item) =>
          item.source === "payment" &&
          (item.href === routes.payment(payment.id) ||
            item.id === `sys-pay-enr-${payment.enrollmentId}`),
      )
    ) {
      continue;
    }
    items.push({
      id,
      title: `تأیید پرداخت #${payment.id} — ${userName(payment.userId)}`,
      meta: payment.paymentStatus || "در انتظار تأیید",
      href: routes.payment(payment.id),
      done: false,
      source: "payment",
      priority: 1,
    });
  }

  return items.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title, "fa"));
}

export function toManualBoardItem(task: AdminTask): TaskBoardItem {
  return {
    id: `manual-${task.numericId}`,
    title: task.title,
    meta: task.meta || "تسک دستی",
    href: task.href || routes.root,
    done: task.done,
    source: "manual",
    numericId: task.numericId,
    priority: task.done ? 9 : 4,
    createdAt: task.createdAt,
  };
}
