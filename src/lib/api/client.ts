import { blogApi } from "@/lib/api/blog.api";
import { bootcampsApi } from "@/lib/api/bootcamps.api";
import { certificatesApi } from "@/lib/api/certificates.api";
import { customersApi } from "@/lib/api/customers.api";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { instructorsApi } from "@/lib/api/instructors.api";
import { partnersApi } from "@/lib/api/partners.api";
import { paymentsApi } from "@/lib/api/payments.api";
import { sponsorsApi } from "@/lib/api/sponsors.api";
import { topicsApi } from "@/lib/api/topics.api";
import { mockStore } from "@/lib/api/mock/store";
import {
  type BlogPostInput,
  type Bootcamp,
  type BootcampInput,
  type CallOutcome,
  type EnrollmentStatus,
  type InstructorInput,
  type ListParams,
  type LoginInput,
  type SessionUser,
  type SponsorInput,
  type TopicInput,
  type UserUpdateInput,
} from "@/lib/api/types";
import { delay } from "@/lib/utils";

/**
 * Hybrid facade:
 * - Live modules call real `*.api.ts` clients (cookie auth via `apiRequest`)
 * - Remaining modules stay on `mockStore` until wired one-by-one
 * - UI / React Query should only talk to `adminApi`, never `mockStore`
 *
 * Panel docs: https://api.kelaasor.com/swagger/docs/#/panel
 * Same `NEXT_PUBLIC_API_BASE_URL` as kelaasor-camp.
 *
 * Auth is local-only until POST /panel/admin/auth/login/ is fixed on backend.
 */

async function run<T>(fn: () => T): Promise<T> {
  await delay(160);
  return fn();
}

function localSession(input?: LoginInput): SessionUser {
  const email = input?.email.trim() || "staff@local";
  return {
    id: 1,
    email,
    name: email.split("@")[0] || "مدیر",
    role: "staff",
  };
}

export const adminApi = {
  /** LOCAL — backend login endpoint currently hangs / unusable */
  auth: {
    login: async (input: LoginInput): Promise<SessionUser> => {
      await delay(120);
      return localSession(input);
    },
    me: async (): Promise<SessionUser> => {
      await delay(80);
      return localSession();
    },
  },
  /** LIVE — /panel/admin/dashboard/ */
  dashboard: {
    stats: () => dashboardApi.stats(),
  },
  /** MOCK — wire next */
  enrollments: {
    list: (params?: ListParams) => run(() => mockStore.listEnrollments(params)),
    get: (id: number) => run(() => mockStore.getEnrollment(id)),
    updateStatus: (id: number, status: EnrollmentStatus, notes?: string) =>
      run(() => mockStore.updateEnrollmentStatus(id, status, notes)),
  },
  /** LIVE — /panel/admin/payments/... */
  payments: {
    list: (params?: ListParams) => paymentsApi.list(params),
    get: (id: number) => paymentsApi.get(id),
    verify: (id: number, approved: boolean) => paymentsApi.verify(id, approved),
    markInstallmentPaid: (paymentId: number, installmentId: number) =>
      paymentsApi.markInstallmentPaid(paymentId, installmentId),
    rejectInstallment: (paymentId: number, installmentId: number) =>
      paymentsApi.rejectInstallment(paymentId, installmentId),
  },
  /** LIVE — /panel/admin/certificates/... (revoke not in API yet) */
  certificates: {
    list: (params?: ListParams) => certificatesApi.list(params),
    get: (id: number) => certificatesApi.get(id),
    issue: (enrollmentId: number) => certificatesApi.issue(enrollmentId),
    revoke: (id: number) => certificatesApi.revoke(id),
  },
  /** MOCK — wire next */
  settings: {
    get: () => run(() => mockStore.getSettings()),
    update: (patch: Partial<import("@/lib/api/types").AppSettings>) =>
      run(() => mockStore.updateSettings(patch)),
  },
  /** LIVE — /panel/admin/bootcamps/... */
  bootcamps: {
    list: (params?: ListParams) => bootcampsApi.list(params),
    get: (id: number) => bootcampsApi.get(id),
    create: (input: BootcampInput) => bootcampsApi.create(input),
    update: (id: number, input: Partial<BootcampInput> & Partial<Bootcamp>) =>
      bootcampsApi.update(id, input),
    remove: (id: number) => bootcampsApi.remove(id),
    setChapters: (id: number, chapters: Bootcamp["chapters"]) =>
      bootcampsApi.setChapters(id, chapters),
    setMedias: (id: number, medias: Bootcamp["medias"]) =>
      bootcampsApi.setMedias(id, medias),
  },
  /** MOCK list/get — update goes through live customers PATCH */
  users: {
    list: (params?: ListParams) => run(() => mockStore.listUsers(params)),
    get: (id: number) => run(() => mockStore.getUser(id)),
    update: (id: number, patch: UserUpdateInput) => customersApi.update(id, patch),
  },
  /** LIVE — /panel/admin/customers/... (follow-up/tags not in API yet) */
  customers: {
    list: (params?: ListParams) => customersApi.list(params),
    get: (id: number) => customersApi.get(id),
    addNote: (userId: number, body: string) => customersApi.addNote(userId, body),
    deleteNote: (userId: number, noteId: number) =>
      customersApi.deleteNote(userId, noteId),
    addCall: (input: {
      userId: number;
      enrollmentId?: number | null;
      calledAt?: string;
      durationMinutes?: number | null;
      outcome: CallOutcome;
      summary: string;
    }) => customersApi.addCall(input),
    toggleStar: (userId: number) => customersApi.toggleStar(userId),
    setFollowUp: (userId: number, followUpAt: string | null) =>
      customersApi.setFollowUp(userId, followUpAt),
    setTags: (userId: number, crmTags: string[]) =>
      customersApi.setTags(userId, crmTags),
  },
  /** LIVE — /panel/admin/instructors/... */
  instructors: {
    list: (params?: ListParams) => instructorsApi.list(params),
    get: (id: number) => instructorsApi.get(id),
    create: (input: InstructorInput) => instructorsApi.create(input),
    update: (id: number, input: InstructorInput) =>
      instructorsApi.update(id, input),
    remove: (id: number) => instructorsApi.remove(id),
  },
  /** LIVE — /panel/admin/blog/... */
  blog: {
    list: (params?: ListParams) => blogApi.list(params),
    get: (id: number) => blogApi.get(id),
    create: (input: BlogPostInput) => blogApi.create(input),
    update: (id: number, input: Partial<BlogPostInput>) => blogApi.update(id, input),
    remove: (id: number) => blogApi.remove(id),
    categories: () => blogApi.categories(),
    moderateComment: (postId: number, commentId: number, approved: boolean) =>
      blogApi.moderateComment(postId, commentId, approved),
  },
  /** LIVE — /panel/admin/topics/... */
  topics: {
    list: () => topicsApi.list(),
    create: (input: TopicInput) => topicsApi.create(input),
    update: (id: number, input: TopicInput) => topicsApi.update(id, input),
    remove: (id: number) => topicsApi.remove(id),
  },
  /** LIVE — /panel/admin/sponsors/... */
  sponsors: {
    list: () => sponsorsApi.list(),
    create: (input: SponsorInput) => sponsorsApi.create(input),
    update: (id: number, input: SponsorInput) => sponsorsApi.update(id, input),
    remove: (id: number) => sponsorsApi.remove(id),
  },
  /** LIVE — /panel/admin/partners/... */
  partners: {
    list: () => partnersApi.list(),
    create: (input: import("@/lib/api/types").PartnerCompanyInput) =>
      partnersApi.create(input),
    update: (id: number, input: import("@/lib/api/types").PartnerCompanyInput) =>
      partnersApi.update(id, input),
    remove: (id: number) => partnersApi.remove(id),
  },
};

/** @deprecated Prefer values from query/API payloads once modules are live. */
export function userName(userId: number) {
  const user = mockStore.getUser(userId);
  return user ? `${user.firstName} ${user.lastName}` : "کاربر";
}

/** @deprecated Prefer values from query/API payloads once modules are live. */
export function bootcampTitle(bootcampId: number) {
  return mockStore.getBootcamp(bootcampId)?.title ?? "بوت‌کمپ";
}
