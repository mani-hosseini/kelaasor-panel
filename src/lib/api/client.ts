import { authApi } from "@/lib/api/auth.api";
import { blogApi } from "@/lib/api/blog.api";
import { bootcampsApi } from "@/lib/api/bootcamps.api";
import { certificatesApi } from "@/lib/api/certificates.api";
import { customersApi } from "@/lib/api/customers.api";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { enrollmentsApi } from "@/lib/api/enrollments.api";
import { instructorsApi } from "@/lib/api/instructors.api";
import { pagesApi } from "@/lib/api/pages.api";
import { partnersApi } from "@/lib/api/partners.api";
import { paymentsApi } from "@/lib/api/payments.api";
import { settingsApi } from "@/lib/api/settings.api";
import { sponsorsApi } from "@/lib/api/sponsors.api";
import {
  surveysApi,
  type SurveyInput,
  type SurveyListParams,
} from "@/lib/api/surveys.api";
import { tasksApi } from "@/lib/api/tasks.api";
import { topicsApi } from "@/lib/api/topics.api";
import {
  type BlogPostInput,
  type Bootcamp,
  type BootcampInput,
  type CallOutcome,
  type EnrollmentStatus,
  type InstructorInput,
  type ListParams,
  type LoginInput,
  type SponsorInput,
  type TopicInput,
  type UserUpdateInput,
} from "@/lib/api/types";

/**
 * Live facade over `/panel/admin/...` (cookie auth via `apiRequest`).
 * Same `NEXT_PUBLIC_API_BASE_URL` as kelaasor-camp.
 * Docs: https://api.kelaasor.com/swagger/docs/#/panel
 */
export const adminApi = {
  auth: {
    login: (input: LoginInput) => authApi.login(input),
    me: () => authApi.me(),
    logout: () => authApi.logout(),
  },
  dashboard: {
    stats: () => dashboardApi.stats(),
  },
  enrollments: {
    list: (params?: ListParams) => enrollmentsApi.list(params),
    get: (id: number) => enrollmentsApi.get(id),
    updateStatus: (id: number, status: EnrollmentStatus, notes?: string) =>
      enrollmentsApi.updateStatus(id, status, notes),
  },
  payments: {
    list: (params?: ListParams) => paymentsApi.list(params),
    get: (id: number) => paymentsApi.get(id),
    verify: (id: number, approved: boolean) => paymentsApi.verify(id, approved),
    markInstallmentPaid: (paymentId: number, installmentId: number) =>
      paymentsApi.markInstallmentPaid(paymentId, installmentId),
    rejectInstallment: (paymentId: number, installmentId: number) =>
      paymentsApi.rejectInstallment(paymentId, installmentId),
  },
  certificates: {
    list: (params?: ListParams) => certificatesApi.list(params),
    get: (id: number) => certificatesApi.get(id),
    issue: (enrollmentId: number) => certificatesApi.issue(enrollmentId),
    revoke: (id: number) => certificatesApi.revoke(id),
  },
  settings: {
    get: () => settingsApi.get(),
    update: (patch: Partial<import("@/lib/api/types").AppSettings>) =>
      settingsApi.update(patch),
  },
  pages: {
    list: () => pagesApi.list(),
    get: (key: string) => pagesApi.get(key),
    update: (
      key: string,
      input: { title?: string; content?: string; data?: Record<string, unknown> },
    ) => pagesApi.update(key, input),
  },
  tasks: {
    list: () => tasksApi.list(),
    get: (id: number) => tasksApi.get(id),
    create: (input: import("@/lib/api/tasks.api").AdminTaskInput) =>
      tasksApi.create(input),
    update: (id: number, input: Partial<import("@/lib/api/tasks.api").AdminTaskInput>) =>
      tasksApi.update(id, input),
    remove: (id: number) => tasksApi.remove(id),
  },
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
  users: {
    list: async (params?: ListParams) => customersApi.list(params),
    get: async (id: number) => {
      const detail = await customersApi.get(id);
      return detail.user;
    },
    update: (id: number, patch: UserUpdateInput) => customersApi.update(id, patch),
  },
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
  instructors: {
    list: (params?: ListParams) => instructorsApi.list(params),
    get: (id: number) => instructorsApi.get(id),
    create: (input: InstructorInput) => instructorsApi.create(input),
    update: (id: number, input: InstructorInput) =>
      instructorsApi.update(id, input),
    remove: (id: number) => instructorsApi.remove(id),
  },
  surveys: {
    list: (params?: SurveyListParams) => surveysApi.list(params),
    get: (id: number) => surveysApi.get(id),
    create: (input: SurveyInput) => surveysApi.create(input),
    update: (id: number, input: Partial<SurveyInput>) => surveysApi.update(id, input),
    remove: (id: number) => surveysApi.remove(id),
    activate: (id: number) => surveysApi.activate(id),
    close: (id: number) => surveysApi.close(id),
    report: (id: number) => surveysApi.report(id),
    formOptions: () => surveysApi.formOptions(),
  },
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
  topics: {
    list: () => topicsApi.list(),
    create: (input: TopicInput) => topicsApi.create(input),
    update: (id: number, input: TopicInput) => topicsApi.update(id, input),
    remove: (id: number) => topicsApi.remove(id),
  },
  sponsors: {
    list: () => sponsorsApi.list(),
    create: (input: SponsorInput) => sponsorsApi.create(input),
    update: (id: number, input: SponsorInput) => sponsorsApi.update(id, input),
    remove: (id: number) => sponsorsApi.remove(id),
  },
  partners: {
    list: () => partnersApi.list(),
    create: (input: import("@/lib/api/types").PartnerCompanyInput) =>
      partnersApi.create(input),
    update: (id: number, input: import("@/lib/api/types").PartnerCompanyInput) =>
      partnersApi.update(id, input),
    remove: (id: number) => partnersApi.remove(id),
  },
};
