import { authApi } from "@/lib/api/auth.api";
import { blogApi } from "@/lib/api/blog.api";
import { bootcampsApi } from "@/lib/api/bootcamps.api";
import { certificatesApi } from "@/lib/api/certificates.api";
import { customersApi } from "@/lib/api/customers.api";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { enrollmentsApi } from "@/lib/api/enrollments.api";
import { instructorsApi } from "@/lib/api/instructors.api";
import { isMockMode } from "@/lib/api/mode";
import { mockExtras } from "@/lib/api/mock/extras";
import { mockStore } from "@/lib/api/mock/store";
import { pagesApi } from "@/lib/api/pages.api";
import { partnersApi } from "@/lib/api/partners.api";
import { paymentsApi } from "@/lib/api/payments.api";
import { settingsApi } from "@/lib/api/settings.api";
import { sponsorsApi } from "@/lib/api/sponsors.api";
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
  type SessionUser,
  type SponsorInput,
  type TopicInput,
  type UserUpdateInput,
} from "@/lib/api/types";
import { delay } from "@/lib/utils";

/**
 * Hybrid facade:
 * - Live: `/panel/admin/...` via `*.api.ts` (cookie auth)
 * - Mock: `NEXT_PUBLIC_USE_MOCK=true` → seed `mockStore` (offline UI)
 *
 * Docs: https://api.kelaasor.com/swagger/docs/#/panel
 */

async function runMock<T>(fn: () => T): Promise<T> {
  await delay(140);
  return fn();
}

function localSession(input?: LoginInput): SessionUser {
  const email = input?.email.trim() || "staff@mock";
  return {
    id: 1,
    email,
    name: email.split("@")[0] || "مدیر ماک",
    role: "staff",
  };
}

const useMock = isMockMode();

export const adminApi = {
  auth: {
    login: async (input: LoginInput): Promise<SessionUser> => {
      if (useMock) return runMock(() => localSession(input));
      return authApi.login(input);
    },
    me: async (): Promise<SessionUser> => {
      if (useMock) return runMock(() => localSession());
      return authApi.me();
    },
    logout: async (): Promise<void> => {
      if (useMock) return runMock(() => undefined);
      return authApi.logout();
    },
  },
  dashboard: {
    stats: () =>
      useMock ? runMock(() => mockStore.dashboard()) : dashboardApi.stats(),
  },
  enrollments: {
    list: (params?: ListParams) =>
      useMock
        ? runMock(() => mockStore.listEnrollments(params))
        : enrollmentsApi.list(params),
    get: (id: number) =>
      useMock
        ? runMock(() => {
            const item = mockStore.getEnrollment(id);
            if (!item) throw new Error("ثبت‌نام پیدا نشد.");
            return item;
          })
        : enrollmentsApi.get(id),
    updateStatus: (id: number, status: EnrollmentStatus, notes?: string) =>
      useMock
        ? runMock(() => mockStore.updateEnrollmentStatus(id, status, notes))
        : enrollmentsApi.updateStatus(id, status, notes),
  },
  payments: {
    list: (params?: ListParams) =>
      useMock
        ? runMock(() => mockStore.listPayments(params))
        : paymentsApi.list(params),
    get: (id: number) =>
      useMock
        ? runMock(() => {
            const item = mockStore.getPayment(id);
            if (!item) throw new Error("پرداخت پیدا نشد.");
            return item;
          })
        : paymentsApi.get(id),
    verify: (id: number, approved: boolean) =>
      useMock
        ? runMock(() => mockStore.verifyPayment(id, approved))
        : paymentsApi.verify(id, approved),
    markInstallmentPaid: (paymentId: number, installmentId: number) =>
      useMock
        ? runMock(() => mockStore.markInstallmentPaid(paymentId, installmentId))
        : paymentsApi.markInstallmentPaid(paymentId, installmentId),
    rejectInstallment: (paymentId: number, installmentId: number) =>
      useMock
        ? runMock(() => mockStore.rejectInstallmentReceipt(paymentId, installmentId))
        : paymentsApi.rejectInstallment(paymentId, installmentId),
    applyCoupon: (paymentId: number, amount: number) =>
      useMock
        ? runMock(() => mockStore.applyCoupon(paymentId, amount))
        : paymentsApi.applyCoupon(paymentId, amount),
  },
  certificates: {
    list: (params?: ListParams) =>
      useMock
        ? runMock(() => mockStore.listCertificates(params))
        : certificatesApi.list(params),
    get: (id: number) =>
      useMock
        ? runMock(() => {
            const item = mockStore.getCertificate(id);
            if (!item) throw new Error("گواهی پیدا نشد.");
            return item;
          })
        : certificatesApi.get(id),
    issue: (enrollmentId: number) =>
      useMock
        ? runMock(() => mockStore.issueCertificate(enrollmentId))
        : certificatesApi.issue(enrollmentId),
    revoke: (id: number) =>
      useMock
        ? runMock(() => mockStore.revokeCertificate(id))
        : certificatesApi.revoke(id),
  },
  settings: {
    get: () =>
      useMock ? runMock(() => mockStore.getSettings()) : settingsApi.get(),
    update: (patch: Partial<import("@/lib/api/types").AppSettings>) =>
      useMock
        ? runMock(() => mockStore.updateSettings(patch))
        : settingsApi.update(patch),
  },
  pages: {
    list: () =>
      useMock ? runMock(() => mockExtras.listPages()) : pagesApi.list(),
    get: (key: string) =>
      useMock ? runMock(() => mockExtras.getPage(key)) : pagesApi.get(key),
    update: (
      key: string,
      input: { title?: string; content?: string; data?: Record<string, unknown> },
    ) =>
      useMock
        ? runMock(() => mockExtras.updatePage(key, input))
        : pagesApi.update(key, input),
  },
  tasks: {
    list: () =>
      useMock ? runMock(() => mockExtras.listTasks()) : tasksApi.list(),
    get: (id: number) =>
      useMock ? runMock(() => mockExtras.getTask(id)) : tasksApi.get(id),
    create: (input: import("@/lib/api/tasks.api").AdminTaskInput) =>
      useMock
        ? runMock(() => mockExtras.createTask(input))
        : tasksApi.create(input),
    update: (
      id: number,
      input: Partial<import("@/lib/api/tasks.api").AdminTaskInput>,
    ) =>
      useMock
        ? runMock(() => mockExtras.updateTask(id, input))
        : tasksApi.update(id, input),
    remove: (id: number) =>
      useMock ? runMock(() => mockExtras.removeTask(id)) : tasksApi.remove(id),
  },
  bootcamps: {
    list: (params?: ListParams) =>
      useMock
        ? runMock(() => mockStore.listBootcamps(params))
        : bootcampsApi.list(params),
    get: (id: number) =>
      useMock
        ? runMock(() => {
            const item = mockStore.getBootcamp(id);
            if (!item) throw new Error("بوت‌کمپ پیدا نشد.");
            return item;
          })
        : bootcampsApi.get(id),
    create: (input: BootcampInput) =>
      useMock
        ? runMock(() => mockStore.createBootcamp(input))
        : bootcampsApi.create(input),
    update: (id: number, input: Partial<BootcampInput> & Partial<Bootcamp>) =>
      useMock
        ? runMock(() => mockStore.updateBootcamp(id, input))
        : bootcampsApi.update(id, input),
    remove: (id: number) =>
      useMock
        ? runMock(() => {
            mockStore.deleteBootcamp(id);
          })
        : bootcampsApi.remove(id),
    setChapters: (id: number, chapters: Bootcamp["chapters"]) =>
      useMock
        ? runMock(() => mockStore.setBootcampChapters(id, chapters))
        : bootcampsApi.setChapters(id, chapters),
    setMedias: (id: number, medias: Bootcamp["medias"]) =>
      useMock
        ? runMock(() => mockStore.setBootcampMedias(id, medias))
        : bootcampsApi.setMedias(id, medias),
  },
  users: {
    list: async (params?: ListParams) =>
      useMock
        ? runMock(() => mockStore.listUsers(params))
        : customersApi.list(params),
    get: async (id: number) => {
      if (useMock) {
        return runMock(() => {
          const user = mockStore.getUser(id);
          if (!user) throw new Error("کاربر پیدا نشد.");
          return user;
        });
      }
      const detail = await customersApi.get(id);
      return detail.user;
    },
    update: (id: number, patch: UserUpdateInput) =>
      useMock
        ? runMock(() => mockStore.updateUser(id, patch))
        : customersApi.update(id, patch),
  },
  customers: {
    list: (params?: ListParams) =>
      useMock
        ? runMock(() => mockStore.listCustomers(params))
        : customersApi.list(params),
    get: (id: number) =>
      useMock
        ? runMock(() => {
            const detail = mockStore.getCustomerDetail(id);
            if (!detail) throw new Error("مشتری پیدا نشد.");
            return detail;
          })
        : customersApi.get(id),
    addNote: (userId: number, body: string) =>
      useMock
        ? runMock(() => mockStore.addCustomerNote(userId, body))
        : customersApi.addNote(userId, body),
    deleteNote: (userId: number, noteId: number) =>
      useMock
        ? runMock(() => {
            mockStore.deleteCustomerNote(noteId);
          })
        : customersApi.deleteNote(userId, noteId),
    addCall: (input: {
      userId: number;
      enrollmentId?: number | null;
      calledAt?: string;
      durationMinutes?: number | null;
      outcome: CallOutcome;
      summary: string;
    }) =>
      useMock
        ? runMock(() => mockStore.addCustomerCall(input))
        : customersApi.addCall(input),
    toggleStar: (userId: number) =>
      useMock
        ? runMock(() => mockStore.toggleCustomerStar(userId))
        : customersApi.toggleStar(userId),
    setFollowUp: (userId: number, followUpAt: string | null) =>
      useMock
        ? runMock(() => mockStore.setCustomerFollowUp(userId, followUpAt))
        : customersApi.setFollowUp(userId, followUpAt),
    setTags: (userId: number, crmTags: string[]) =>
      useMock
        ? runMock(() => mockStore.setCustomerTags(userId, crmTags))
        : customersApi.setTags(userId, crmTags),
  },
  instructors: {
    list: (params?: ListParams) =>
      useMock
        ? runMock(() => mockStore.listInstructors(params))
        : instructorsApi.list(params),
    get: (id: number) =>
      useMock
        ? runMock(() => {
            const item = mockStore.getInstructor(id);
            if (!item) throw new Error("مدرس پیدا نشد.");
            return item;
          })
        : instructorsApi.get(id),
    create: (input: InstructorInput) =>
      useMock
        ? runMock(() => mockStore.createInstructor(input))
        : instructorsApi.create(input),
    update: (id: number, input: InstructorInput) =>
      useMock
        ? runMock(() => mockStore.updateInstructor(id, input))
        : instructorsApi.update(id, input),
    remove: (id: number) =>
      useMock
        ? runMock(() => {
            mockStore.deleteInstructor(id);
          })
        : instructorsApi.remove(id),
  },
  blog: {
    list: (params?: ListParams) =>
      useMock ? runMock(() => mockStore.listBlog(params)) : blogApi.list(params),
    get: (id: number) =>
      useMock
        ? runMock(() => {
            const item = mockStore.getBlog(id);
            if (!item) throw new Error("پست پیدا نشد.");
            return item;
          })
        : blogApi.get(id),
    create: (input: BlogPostInput) =>
      useMock
        ? runMock(() => mockStore.createBlog(input))
        : blogApi.create(input),
    update: (id: number, input: Partial<BlogPostInput>) =>
      useMock
        ? runMock(() => mockStore.updateBlog(id, input))
        : blogApi.update(id, input),
    remove: (id: number) =>
      useMock
        ? runMock(() => {
            mockStore.deleteBlog(id);
          })
        : blogApi.remove(id),
    categories: () =>
      useMock ? runMock(() => mockStore.blogCategories()) : blogApi.categories(),
    moderateComment: (postId: number, commentId: number, approved: boolean) =>
      useMock
        ? runMock(() => mockStore.moderateComment(postId, commentId, approved))
        : blogApi.moderateComment(postId, commentId, approved),
  },
  topics: {
    list: () =>
      useMock ? runMock(() => mockStore.listTopics()) : topicsApi.list(),
    create: (input: TopicInput) =>
      useMock
        ? runMock(() => mockStore.createTopic(input))
        : topicsApi.create(input),
    update: (id: number, input: TopicInput) =>
      useMock
        ? runMock(() => mockStore.updateTopic(id, input))
        : topicsApi.update(id, input),
    remove: (id: number) =>
      useMock
        ? runMock(() => {
            mockStore.deleteTopic(id);
          })
        : topicsApi.remove(id),
  },
  sponsors: {
    list: () =>
      useMock ? runMock(() => mockStore.listSponsors()) : sponsorsApi.list(),
    create: (input: SponsorInput) =>
      useMock
        ? runMock(() => mockStore.createSponsor(input))
        : sponsorsApi.create(input),
    update: (id: number, input: SponsorInput) =>
      useMock
        ? runMock(() => mockStore.updateSponsor(id, input))
        : sponsorsApi.update(id, input),
    remove: (id: number) =>
      useMock
        ? runMock(() => {
            mockStore.deleteSponsor(id);
          })
        : sponsorsApi.remove(id),
  },
  partners: {
    list: () =>
      useMock ? runMock(() => mockStore.listPartners()) : partnersApi.list(),
    create: (input: import("@/lib/api/types").PartnerCompanyInput) =>
      useMock
        ? runMock(() => mockStore.createPartner(input))
        : partnersApi.create(input),
    update: (id: number, input: import("@/lib/api/types").PartnerCompanyInput) =>
      useMock
        ? runMock(() => mockStore.updatePartner(id, input))
        : partnersApi.update(id, input),
    remove: (id: number) =>
      useMock
        ? runMock(() => {
            mockStore.deletePartner(id);
          })
        : partnersApi.remove(id),
  },
};
