import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth";
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
} from "@/lib/api/types";
import { delay } from "@/lib/utils";

async function run<T>(fn: () => T): Promise<T> {
  await delay(160);
  return fn();
}

export const adminApi = {
  auth: {
    async login(input: LoginInput): Promise<SessionUser> {
      await delay(220);
      if (input.email.trim().toLowerCase() !== DEMO_EMAIL || input.password !== DEMO_PASSWORD) {
        throw new Error("ایمیل یا رمز عبور نادرست است.");
      }
      return {
        id: 99,
        name: "مدیر کلاسور",
        email: DEMO_EMAIL,
        role: "staff",
      };
    },
    async me(): Promise<SessionUser> {
      await delay(80);
      return {
        id: 99,
        name: "مدیر کلاسور",
        email: DEMO_EMAIL,
        role: "staff",
      };
    },
  },
  dashboard: {
    stats: () => run(() => mockStore.dashboard()),
  },
  enrollments: {
    list: (params?: ListParams) => run(() => mockStore.listEnrollments(params)),
    get: (id: number) => run(() => mockStore.getEnrollment(id)),
    updateStatus: (id: number, status: EnrollmentStatus, notes?: string) =>
      run(() => mockStore.updateEnrollmentStatus(id, status, notes)),
  },
  payments: {
    list: (params?: ListParams) => run(() => mockStore.listPayments(params)),
    get: (id: number) => run(() => mockStore.getPayment(id)),
    verify: (id: number, approved: boolean) => run(() => mockStore.verifyPayment(id, approved)),
    markInstallmentPaid: (paymentId: number, installmentId: number) =>
      run(() => mockStore.markInstallmentPaid(paymentId, installmentId)),
  },
  bootcamps: {
    list: (params?: ListParams) => run(() => mockStore.listBootcamps(params)),
    get: (id: number) => run(() => mockStore.getBootcamp(id)),
    create: (input: BootcampInput) => run(() => mockStore.createBootcamp(input)),
    update: (id: number, input: Partial<BootcampInput> & Partial<Bootcamp>) =>
      run(() => mockStore.updateBootcamp(id, input)),
    remove: (id: number) => run(() => mockStore.deleteBootcamp(id)),
  },
  users: {
    list: (params?: ListParams) => run(() => mockStore.listUsers(params)),
    get: (id: number) => run(() => mockStore.getUser(id)),
    update: (id: number, patch: { isActive?: boolean; firstName?: string; lastName?: string }) =>
      run(() => mockStore.updateUser(id, patch)),
  },
  customers: {
    list: (params?: ListParams) => run(() => mockStore.listCustomers(params)),
    get: (id: number) => run(() => mockStore.getCustomerDetail(id)),
    addNote: (userId: number, body: string) => run(() => mockStore.addCustomerNote(userId, body)),
    deleteNote: (noteId: number) => run(() => mockStore.deleteCustomerNote(noteId)),
    addCall: (input: {
      userId: number;
      enrollmentId?: number | null;
      calledAt?: string;
      durationMinutes?: number | null;
      outcome: CallOutcome;
      summary: string;
    }) => run(() => mockStore.addCustomerCall(input)),
  },
  instructors: {
    list: (params?: ListParams) => run(() => mockStore.listInstructors(params)),
    get: (id: number) => run(() => mockStore.getInstructor(id)),
    create: (input: InstructorInput) => run(() => mockStore.createInstructor(input)),
    update: (id: number, input: InstructorInput) => run(() => mockStore.updateInstructor(id, input)),
    remove: (id: number) => run(() => mockStore.deleteInstructor(id)),
  },
  blog: {
    list: (params?: ListParams) => run(() => mockStore.listBlog(params)),
    get: (id: number) => run(() => mockStore.getBlog(id)),
    create: (input: BlogPostInput) => run(() => mockStore.createBlog(input)),
    update: (id: number, input: Partial<BlogPostInput>) => run(() => mockStore.updateBlog(id, input)),
    remove: (id: number) => run(() => mockStore.deleteBlog(id)),
    moderateComment: (postId: number, commentId: number, approved: boolean) =>
      run(() => mockStore.moderateComment(postId, commentId, approved)),
    categories: () => run(() => mockStore.blogCategories()),
  },
  topics: {
    list: () => run(() => mockStore.listTopics()),
    create: (input: TopicInput) => run(() => mockStore.createTopic(input)),
    update: (id: number, input: TopicInput) => run(() => mockStore.updateTopic(id, input)),
    remove: (id: number) => run(() => mockStore.deleteTopic(id)),
  },
  sponsors: {
    list: () => run(() => mockStore.listSponsors()),
    create: (input: SponsorInput) => run(() => mockStore.createSponsor(input)),
    update: (id: number, input: SponsorInput) => run(() => mockStore.updateSponsor(id, input)),
    remove: (id: number) => run(() => mockStore.deleteSponsor(id)),
  },
};

export function userName(userId: number) {
  const user = mockStore.getUser(userId);
  return user ? `${user.firstName} ${user.lastName}` : "کاربر";
}

export function bootcampTitle(bootcampId: number) {
  return mockStore.getBootcamp(bootcampId)?.title ?? "بوت‌کمپ";
}
