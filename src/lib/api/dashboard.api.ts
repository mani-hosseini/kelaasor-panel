import {
  normalizeCall,
  normalizeCustomerListItem,
  normalizeEnrollment,
} from "@/lib/api/customers.api";
import { apiRequest } from "@/lib/api/http";
import { enrollmentStatusLabel } from "@/lib/api/labels";
import {
  asBool,
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import type {
  CustomerCall,
  CustomerListItem,
  DashboardQuickLink,
  DashboardStats,
  DashboardTaskItem,
  Enrollment,
  EnrollmentStatus,
} from "@/lib/api/types";

function unwrapDashboardRoot(payload: unknown): Record<string, unknown> {
  const root = unwrapData(payload);
  if (Array.isArray(root)) {
    const first = root[0];
    if (isObj(first)) return first;
    throw new Error("پاسخ داشبورد معتبر نیست");
  }
  if (!isObj(root)) throw new Error("پاسخ داشبورد معتبر نیست");
  return root;
}

function normalizeFunnel(item: unknown): DashboardStats["funnel"][number] | null {
  if (!isObj(item)) return null;
  const status = asNum(item.status);
  if (status == null) return null;
  return {
    status: status as EnrollmentStatus,
    label:
      asStr(item.label) ??
      enrollmentStatusLabel(status as EnrollmentStatus),
    count: asNum(item.count) ?? 0,
  };
}

function normalizeWeekly(
  item: unknown,
): DashboardStats["weeklyEnrollments"][number] | null {
  if (!isObj(item)) return null;
  const week = asStr(item.week);
  if (!week) return null;
  return { week, count: asNum(item.count) ?? 0 };
}

function normalizeQuickLink(item: unknown): DashboardQuickLink | null {
  if (!isObj(item)) return null;
  const id = asStr(item.id);
  const title = asStr(item.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    description: asStr(item.description) ?? "",
    href: asStr(item.href) ?? "/",
    count: asNum(item.count) ?? 0,
  };
}

function normalizeTask(item: unknown): DashboardTaskItem | null {
  if (!isObj(item)) return null;
  const id = asStr(item.id);
  const title = asStr(item.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    meta: asStr(item.meta) ?? "",
    href: asStr(item.href) ?? "/",
    done: asBool(item.done),
  };
}

function normalizeCustomers(value: unknown): CustomerListItem[] {
  return unwrapList(value, ["customers"])
    .map(normalizeCustomerListItem)
    .filter((item): item is CustomerListItem => item != null);
}

function normalizeEnrollments(value: unknown): Enrollment[] {
  return unwrapList(value, ["enrollments"])
    .map(normalizeEnrollment)
    .filter((item): item is Enrollment => item != null);
}

function normalizeCalls(value: unknown): CustomerCall[] {
  return unwrapList(value, ["calls"])
    .map((item) => normalizeCall(item))
    .filter((item): item is CustomerCall => item != null);
}

export const dashboardApi = {
  async stats(): Promise<DashboardStats> {
    const payload = await apiRequest<unknown>("/panel/admin/dashboard/");
    const root = unwrapDashboardRoot(payload);

    const funnel = unwrapList(root.funnel ?? [], ["funnel"])
      .map(normalizeFunnel)
      .filter((item): item is DashboardStats["funnel"][number] => item != null);

    const weeklyEnrollments = unwrapList(
      root.weekly_enrollments ?? root.weeklyEnrollments ?? [],
      ["weekly_enrollments", "weeklyEnrollments"],
    )
      .map(normalizeWeekly)
      .filter(
        (item): item is DashboardStats["weeklyEnrollments"][number] =>
          item != null,
      );

    const priorityCustomers = normalizeCustomers(
      root.priority_customers ?? root.priorityCustomers,
    );
    const coldCustomers = normalizeCustomers(
      root.cold_customers ?? root.coldCustomers,
    );
    const starredCustomers = normalizeCustomers(
      root.starred_customers ?? root.starredCustomers,
    );
    // Follow-up lists are not in current swagger; keep empty for UI slots.
    const followUpCustomers = normalizeCustomers(
      root.follow_up_customers ?? root.followUpCustomers ?? [],
    );

    return {
      totalUsers: asNum(root.total_users) ?? asNum(root.totalUsers) ?? 0,
      activeBootcamps:
        asNum(root.active_bootcamps) ?? asNum(root.activeBootcamps) ?? 0,
      pendingAdminActions:
        asNum(root.pending_admin_actions) ??
        asNum(root.pendingAdminActions) ??
        0,
      awaitingPaymentVerification:
        asNum(root.awaiting_payment_verification) ??
        asNum(root.awaitingPaymentVerification) ??
        0,
      awaitingCounselorCall:
        asNum(root.awaiting_counselor_call) ??
        asNum(root.awaitingCounselorCall) ??
        0,
      confirmedThisMonth:
        asNum(root.confirmed_this_month) ??
        asNum(root.confirmedThisMonth) ??
        0,
      estimatedRevenue:
        asNum(root.estimated_revenue) ?? asNum(root.estimatedRevenue) ?? 0,
      collectedRevenue:
        asNum(root.collected_revenue) ?? asNum(root.collectedRevenue) ?? 0,
      unpaidAmount: asNum(root.unpaid_amount) ?? asNum(root.unpaidAmount) ?? 0,
      adminQueueProgress:
        asNum(root.admin_queue_progress) ??
        asNum(root.adminQueueProgress) ??
        0,
      starredCount: asNum(root.starred_count) ?? asNum(root.starredCount) ?? 0,
      overdueFollowUpsCount:
        asNum(root.overdue_follow_ups_count) ??
        asNum(root.overdueFollowUpsCount) ??
        0,
      todayFollowUpsCount:
        asNum(root.today_follow_ups_count) ??
        asNum(root.todayFollowUpsCount) ??
        0,
      coldCustomersCount:
        asNum(root.cold_customers_count) ??
        asNum(root.coldCustomersCount) ??
        0,
      certificatesToIssue:
        asNum(root.certificates_to_issue) ??
        asNum(root.certificatesToIssue) ??
        0,
      pendingBlogComments:
        asNum(root.pending_blog_comments) ??
        asNum(root.pendingBlogComments) ??
        0,
      funnel,
      weeklyEnrollments,
      recentEnrollments: normalizeEnrollments(
        root.recent_enrollments ?? root.recentEnrollments,
      ),
      priorityCustomers,
      followUpCustomers,
      coldCustomers,
      starredCustomers,
      quickLinks: unwrapList(root.quick_links ?? root.quickLinks ?? [], [
        "quick_links",
        "quickLinks",
      ])
        .map(normalizeQuickLink)
        .filter((item): item is DashboardQuickLink => item != null),
      todayTasks: unwrapList(root.today_tasks ?? root.todayTasks ?? [], [
        "today_tasks",
        "todayTasks",
      ])
        .map(normalizeTask)
        .filter((item): item is DashboardTaskItem => item != null),
      recentCalls: normalizeCalls(root.recent_calls ?? root.recentCalls),
    };
  },
};
