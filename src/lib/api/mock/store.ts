import {
  BLOG_STATUS,
  CALL_OUTCOME,
  ENROLLMENT_STATUS,
  NEXT_STEP_BY,
  type AdminUser,
  type BlogCategory,
  type BlogPost,
  type BlogPostInput,
  type Bootcamp,
  type BootcampInput,
  type CallOutcome,
  type CustomerCall,
  type CustomerDetail,
  type CustomerListItem,
  type CustomerNote,
  type DashboardStats,
  type Enrollment,
  type EnrollmentStatus,
  type Instructor,
  type InstructorInput,
  type Payment,
  type Sponsor,
  type SponsorInput,
  type Topic,
  type TopicInput,
} from "@/lib/api/types";
import {
  blogCategories as seedCategories,
  blogPosts as seedPosts,
  bootcamps as seedBootcamps,
  callOutcomeLabels,
  customerCalls as seedCalls,
  customerNotes as seedNotes,
  enrollments as seedEnrollments,
  instructors as seedInstructors,
  payments as seedPayments,
  sponsors as seedSponsors,
  topics as seedTopics,
  users as seedUsers,
  enrollmentStatusMeta,
} from "@/lib/api/mock/seed";
import { routes } from "@/lib/routes";

type Store = {
  topics: Topic[];
  instructors: Instructor[];
  sponsors: Sponsor[];
  bootcamps: Bootcamp[];
  users: AdminUser[];
  enrollments: Enrollment[];
  payments: Payment[];
  customerNotes: CustomerNote[];
  customerCalls: CustomerCall[];
  blogCategories: BlogCategory[];
  blogPosts: BlogPost[];
  nextId: number;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function createStore(): Store {
  return {
    topics: clone(seedTopics),
    instructors: clone(seedInstructors),
    sponsors: clone(seedSponsors),
    bootcamps: clone(seedBootcamps),
    users: clone(seedUsers),
    enrollments: clone(seedEnrollments),
    payments: clone(seedPayments),
    customerNotes: clone(seedNotes),
    customerCalls: clone(seedCalls),
    blogCategories: clone(seedCategories),
    blogPosts: clone(seedPosts),
    nextId: 1000,
  };
}

const globalStore = globalThis as typeof globalThis & {
  __kelaasorAdminStoreV2?: Store;
};

function db() {
  if (!globalStore.__kelaasorAdminStoreV2) {
    globalStore.__kelaasorAdminStoreV2 = createStore();
  }
  return globalStore.__kelaasorAdminStoreV2;
}

function id() {
  const store = db();
  store.nextId += 1;
  return store.nextId;
}

function matches(haystack: string, search?: string) {
  if (!search?.trim()) return true;
  return haystack.toLowerCase().includes(search.trim().toLowerCase());
}

function refreshEnrollmentLabel(item: Enrollment) {
  item.statusLabel = enrollmentStatusMeta[item.status]?.label ?? "نامشخص";
  item.nextStepByDisplay =
    item.nextStepBy === NEXT_STEP_BY.ADMIN ? "ادمین" : "کاربر";
}

function toCustomerListItem(user: AdminUser): CustomerListItem {
  const store = db();
  const enrollments = store.enrollments
    .filter((item) => item.userId === user.id)
    .sort((a, b) => +new Date(b.enrolledAt) - +new Date(a.enrolledAt));
  const active =
    enrollments.find(
      (item) =>
        item.status !== ENROLLMENT_STATUS.CANCELED &&
        item.status !== ENROLLMENT_STATUS.CONFIRMED,
    ) ??
    enrollments[0] ??
    null;
  const notes = store.customerNotes.filter((item) => item.userId === user.id);
  const calls = store.customerCalls
    .filter((item) => item.userId === user.id)
    .sort((a, b) => +new Date(b.calledAt) - +new Date(a.calledAt));
  return {
    ...user,
    enrollmentCount: enrollments.length,
    activeEnrollmentStatus: active?.status ?? null,
    activeEnrollmentLabel: active?.statusLabel ?? null,
    activeBootcampTitle: active
      ? (store.bootcamps.find((b) => b.id === active.bootcampId)?.title ?? null)
      : null,
    notesCount: notes.length,
    callsCount: calls.length,
    lastCallAt: calls[0]?.calledAt ?? null,
  };
}

export const mockStore = {
  dashboard(): DashboardStats {
    const store = db();
    const pendingAdmin = store.enrollments.filter(
      (item) =>
        item.nextStepBy === NEXT_STEP_BY.ADMIN &&
        item.status !== ENROLLMENT_STATUS.CANCELED &&
        item.status !== ENROLLMENT_STATUS.CONFIRMED,
    );
    const awaitingPay = store.enrollments.filter(
      (item) => item.status === ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION,
    );
    const awaitingCall = store.enrollments.filter(
      (item) =>
        item.status === ENROLLMENT_STATUS.THINKING ||
        item.status === ENROLLMENT_STATUS.NO_ANSWER ||
        item.status === ENROLLMENT_STATUS.INITIAL,
    );
    const monthStart = new Date();
    monthStart.setDate(1);
    const confirmedThisMonth = store.enrollments.filter(
      (item) =>
        item.status === ENROLLMENT_STATUS.CONFIRMED &&
        new Date(item.enrolledAt) >= monthStart,
    ).length;
    const estimatedRevenue = store.payments.reduce((sum, p) => sum + p.totalAmount, 0);
    const collectedRevenue = store.payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const unpaidAmount = Math.max(estimatedRevenue - collectedRevenue, 0);
    const openQueue = pendingAdmin.length + awaitingPay.length;
    const closedLike = store.enrollments.filter(
      (item) =>
        item.status === ENROLLMENT_STATUS.CONFIRMED ||
        item.status === ENROLLMENT_STATUS.CANCELED,
    ).length;
    const adminQueueProgress =
      openQueue + closedLike === 0
        ? 100
        : Math.round((closedLike / (openQueue + closedLike)) * 100);

    const funnelOrder: EnrollmentStatus[] = [
      ENROLLMENT_STATUS.INITIAL,
      ENROLLMENT_STATUS.THINKING,
      ENROLLMENT_STATUS.NO_ANSWER,
      ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION,
      ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT,
      ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION,
      ENROLLMENT_STATUS.CONFIRMED,
      ENROLLMENT_STATUS.CANCELED,
    ];
    const weeklyEnrollments = Array.from({ length: 8 }, (_, index) => {
      const start = new Date();
      start.setDate(start.getDate() - (7 - index) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const count = store.enrollments.filter((item) => {
        const at = new Date(item.enrolledAt);
        return at >= start && at < end;
      }).length;
      return { week: `هفته ${8 - index}`, count };
    });

    const priorityCustomers = store.users
      .filter((u) => !u.isStaff)
      .map(toCustomerListItem)
      .filter(
        (item) =>
          item.activeEnrollmentStatus === ENROLLMENT_STATUS.THINKING ||
          item.activeEnrollmentStatus === ENROLLMENT_STATUS.NO_ANSWER ||
          item.activeEnrollmentStatus ===
            ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION ||
          item.activeEnrollmentStatus === ENROLLMENT_STATUS.INITIAL,
      )
      .slice(0, 6);

    const todayTasks = [
      ...pendingAdmin.slice(0, 4).map((item) => {
        const user = store.users.find((u) => u.id === item.userId);
        return {
          id: `enr-${item.id}`,
          title: `پیگیری ثبت‌نام ${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
          meta: item.statusLabel,
          href: routes.customer(item.userId),
          done: false,
        };
      }),
      ...awaitingPay.slice(0, 2).map((item) => {
        const user = store.users.find((u) => u.id === item.userId);
        return {
          id: `pay-${item.id}`,
          title: `تأیید فیش ${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
          meta: "منتظر بررسی پرداخت",
          href: item.paymentId ? routes.payment(item.paymentId) : routes.enrollment(item.id),
          done: false,
        };
      }),
    ].slice(0, 6);

    return {
      totalUsers: store.users.filter((u) => !u.isStaff).length,
      activeBootcamps: store.bootcamps.filter((b) => b.currentEvent).length,
      pendingAdminActions: pendingAdmin.length,
      awaitingPaymentVerification: awaitingPay.length,
      awaitingCounselorCall: awaitingCall.length,
      confirmedThisMonth,
      estimatedRevenue,
      collectedRevenue,
      unpaidAmount,
      adminQueueProgress,
      funnel: funnelOrder.map((status) => ({
        status,
        label: enrollmentStatusMeta[status].label,
        count: store.enrollments.filter((item) => item.status === status).length,
      })),
      weeklyEnrollments,
      recentEnrollments: [...store.enrollments]
        .sort((a, b) => +new Date(b.enrolledAt) - +new Date(a.enrolledAt))
        .slice(0, 6),
      priorityCustomers,
      quickLinks: [
        {
          id: "customers",
          title: "همه مشتریان",
          description: "پروفایل، یادداشت و تماس‌ها",
          href: routes.customers,
          count: store.users.filter((u) => !u.isStaff).length,
        },
        {
          id: "queue",
          title: "صف عملیات ادمین",
          description: "ثبت‌نام‌های منتظر اقدام شما",
          href: routes.enrollments,
          count: pendingAdmin.length,
        },
        {
          id: "payments",
          title: "تأیید پرداخت",
          description: "فیش و چک در انتظار بررسی",
          href: routes.payments,
          count: awaitingPay.length,
        },
      ],
      todayTasks,
      recentCalls: [...store.customerCalls]
        .sort((a, b) => +new Date(b.calledAt) - +new Date(a.calledAt))
        .slice(0, 5),
    };
  },

  listEnrollments(params: { search?: string; status?: number | string; bootcampId?: number } = {}) {
    const store = db();
    return store.enrollments
      .filter((item) => {
        if (
          params.status !== undefined &&
          params.status !== "" &&
          Number(params.status) !== item.status
        ) {
          return false;
        }
        if (params.bootcampId && item.bootcampId !== params.bootcampId) return false;
        const user = store.users.find((u) => u.id === item.userId);
        const bootcamp = store.bootcamps.find((b) => b.id === item.bootcampId);
        return matches(
          `${user?.firstName} ${user?.lastName} ${user?.phoneNumber} ${bootcamp?.title}`,
          params.search,
        );
      })
      .sort((a, b) => +new Date(b.enrolledAt) - +new Date(a.enrolledAt));
  },

  getEnrollment(enrollmentId: number) {
    return db().enrollments.find((item) => item.id === enrollmentId) ?? null;
  },

  updateEnrollmentStatus(enrollmentId: number, status: EnrollmentStatus, notes?: string) {
    const item = this.getEnrollment(enrollmentId);
    if (!item) throw new Error("ثبت‌نام پیدا نشد.");
    item.status = status;
    if (notes !== undefined) item.notes = notes;
    if (status === ENROLLMENT_STATUS.CONFIRMED || status === ENROLLMENT_STATUS.CANCELED) {
      item.nextStepBy = NEXT_STEP_BY.USER;
    } else if (
      status === ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION ||
      status === ENROLLMENT_STATUS.THINKING ||
      status === ENROLLMENT_STATUS.NO_ANSWER ||
      status === ENROLLMENT_STATUS.INITIAL
    ) {
      item.nextStepBy = NEXT_STEP_BY.ADMIN;
    } else {
      item.nextStepBy = NEXT_STEP_BY.USER;
    }
    refreshEnrollmentLabel(item);
    return item;
  },

  listPayments(params: { search?: string } = {}) {
    const store = db();
    return store.payments.filter((item) => {
      const user = store.users.find((u) => u.id === item.userId);
      const bootcamp = store.bootcamps.find((b) => b.id === item.bootcampId);
      return matches(
        `${user?.firstName} ${user?.lastName} ${bootcamp?.title} ${item.paymentStatus}`,
        params.search,
      );
    });
  },

  getPayment(paymentId: number) {
    return db().payments.find((item) => item.id === paymentId) ?? null;
  },

  verifyPayment(paymentId: number, approved: boolean) {
    const payment = this.getPayment(paymentId);
    if (!payment) throw new Error("پرداخت پیدا نشد.");
    payment.verified = approved;
    payment.paymentStatus = approved ? "پرداخت‌شده" : "رد شده";
    if (approved) {
      payment.paidPercentage = 100;
      payment.paidAmount = payment.totalAmount;
      this.updateEnrollmentStatus(payment.enrollmentId, ENROLLMENT_STATUS.CONFIRMED);
    } else {
      this.updateEnrollmentStatus(
        payment.enrollmentId,
        ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT,
        "فیش رد شد؛ کاربر باید دوباره آپلود کند.",
      );
    }
    return payment;
  },

  markInstallmentPaid(paymentId: number, installmentId: number) {
    const payment = this.getPayment(paymentId);
    if (!payment) throw new Error("پرداخت پیدا نشد.");
    const installment = payment.installments.find((row) => row.id === installmentId);
    if (!installment) throw new Error("قسط پیدا نشد.");
    installment.isPaid = true;
    installment.paidAt = new Date().toISOString();
    installment.paymentReceipt = installment.paymentReceipt ?? "/receipts/mock.jpg";
    const paid = payment.installments
      .filter((row) => row.isPaid)
      .reduce((sum, row) => sum + row.amount, 0);
    payment.paidAmount = paid;
    payment.paidPercentage = Math.round((paid / payment.totalAmount) * 100);
    payment.paymentStatus =
      payment.paidPercentage >= 100 ? "پرداخت‌شده" : "اقساط در جریان";
    if (payment.paidPercentage >= 100) {
      payment.verified = true;
      this.updateEnrollmentStatus(payment.enrollmentId, ENROLLMENT_STATUS.CONFIRMED);
    }
    return payment;
  },

  listBootcamps(params: { search?: string } = {}) {
    return db().bootcamps.filter((item) => matches(`${item.title} ${item.brief}`, params.search));
  },

  getBootcamp(bootcampId: number) {
    return db().bootcamps.find((item) => item.id === bootcampId) ?? null;
  },

  createBootcamp(input: BootcampInput) {
    const store = db();
    const bootcamp: Bootcamp = {
      id: id(),
      title: input.title,
      slug: input.slug,
      brief: input.brief,
      description: input.description,
      banner: null,
      durationInWeeks: input.durationInWeeks,
      capacity: input.capacity,
      ordering: store.bootcamps.length + 1,
      hasBnpl: input.hasBnpl,
      topicId: input.topicId,
      instructorIds: [],
      sponsorIds: [],
      chapters: [],
      medias: [],
      currentEvent: {
        id: id(),
        status: 1,
        statusDisplay: "در حال ثبت‌نام",
        totalEnrollmentsCount: 0,
        confirmedEnrollmentsCount: 0,
        startDate: input.startDate,
        endDate: input.endDate,
        sessionsScheduleDays: input.sessionsScheduleDays,
        sessionsScheduleHours: input.sessionsScheduleHours,
        primaryPrice: input.primaryPrice,
        finalPrice: input.finalPrice,
        capacity: input.capacity,
        registrationDeadline: input.startDate,
      },
    };
    store.bootcamps.unshift(bootcamp);
    return bootcamp;
  },

  updateBootcamp(bootcampId: number, input: Partial<BootcampInput> & Partial<Bootcamp>) {
    const bootcamp = this.getBootcamp(bootcampId);
    if (!bootcamp) throw new Error("بوت‌کمپ پیدا نشد.");
    Object.assign(bootcamp, input);
    if (bootcamp.currentEvent) {
      if (input.primaryPrice != null) bootcamp.currentEvent.primaryPrice = input.primaryPrice;
      if (input.finalPrice != null) bootcamp.currentEvent.finalPrice = input.finalPrice;
      if (input.startDate) bootcamp.currentEvent.startDate = input.startDate;
      if (input.endDate) bootcamp.currentEvent.endDate = input.endDate;
      if (input.sessionsScheduleDays) {
        bootcamp.currentEvent.sessionsScheduleDays = input.sessionsScheduleDays;
      }
      if (input.sessionsScheduleHours) {
        bootcamp.currentEvent.sessionsScheduleHours = input.sessionsScheduleHours;
      }
      if (input.capacity) bootcamp.currentEvent.capacity = input.capacity;
    }
    return bootcamp;
  },

  deleteBootcamp(bootcampId: number) {
    const store = db();
    store.bootcamps = store.bootcamps.filter((item) => item.id !== bootcampId);
  },

  listUsers(params: { search?: string } = {}) {
    return db().users.filter((item) =>
      matches(`${item.firstName} ${item.lastName} ${item.phoneNumber} ${item.email}`, params.search),
    );
  },

  listCustomers(params: { search?: string; status?: number | string } = {}): CustomerListItem[] {
    return this.listUsers(params)
      .filter((item) => !item.isStaff)
      .map(toCustomerListItem)
      .filter((item) => {
        if (params.status === undefined || params.status === "") return true;
        return item.activeEnrollmentStatus === Number(params.status);
      });
  },

  getUser(userId: number) {
    return db().users.find((item) => item.id === userId) ?? null;
  },

  getCustomerDetail(userId: number): CustomerDetail | null {
    const user = this.getUser(userId);
    if (!user || user.isStaff) return null;
    const store = db();
    return {
      user,
      enrollments: store.enrollments
        .filter((item) => item.userId === userId)
        .sort((a, b) => +new Date(b.enrolledAt) - +new Date(a.enrolledAt)),
      notes: store.customerNotes
        .filter((item) => item.userId === userId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      calls: store.customerCalls
        .filter((item) => item.userId === userId)
        .sort((a, b) => +new Date(b.calledAt) - +new Date(a.calledAt)),
    };
  },

  addCustomerNote(userId: number, body: string) {
    if (!body.trim()) throw new Error("متن یادداشت خالی است.");
    if (!this.getUser(userId)) throw new Error("مشتری پیدا نشد.");
    const note: CustomerNote = {
      id: id(),
      userId,
      body: body.trim(),
      authorName: "مدیر کلاسور",
      createdAt: new Date().toISOString(),
    };
    db().customerNotes.unshift(note);
    return note;
  },

  deleteCustomerNote(noteId: number) {
    const store = db();
    store.customerNotes = store.customerNotes.filter((item) => item.id !== noteId);
  },

  addCustomerCall(input: {
    userId: number;
    enrollmentId?: number | null;
    calledAt?: string;
    durationMinutes?: number | null;
    outcome: CallOutcome;
    summary: string;
  }) {
    if (!input.summary.trim()) throw new Error("خلاصه تماس خالی است.");
    if (!this.getUser(input.userId)) throw new Error("مشتری پیدا نشد.");
    const call: CustomerCall = {
      id: id(),
      userId: input.userId,
      enrollmentId: input.enrollmentId ?? null,
      calledAt: input.calledAt ?? new Date().toISOString(),
      durationMinutes: input.durationMinutes ?? null,
      outcome: input.outcome,
      outcomeLabel: callOutcomeLabels[input.outcome] ?? input.outcome,
      summary: input.summary.trim(),
      authorName: "مدیر کلاسور",
    };
    db().customerCalls.unshift(call);

    if (input.outcome === CALL_OUTCOME.NO_ANSWER && input.enrollmentId) {
      const enrollment = this.getEnrollment(input.enrollmentId);
      if (
        enrollment &&
        (enrollment.status === ENROLLMENT_STATUS.THINKING ||
          enrollment.status === ENROLLMENT_STATUS.INITIAL)
      ) {
        this.updateEnrollmentStatus(input.enrollmentId, ENROLLMENT_STATUS.NO_ANSWER);
      }
    }

    return call;
  },

  updateUser(userId: number, patch: Partial<AdminUser>) {
    const user = this.getUser(userId);
    if (!user) throw new Error("کاربر پیدا نشد.");
    Object.assign(user, patch);
    return user;
  },

  listInstructors(params: { search?: string } = {}) {
    return db().instructors.filter((item) =>
      matches(`${item.fullName} ${item.jobTitle} ${item.company}`, params.search),
    );
  },

  getInstructor(instructorId: number) {
    return db().instructors.find((item) => item.id === instructorId) ?? null;
  },

  createInstructor(input: InstructorInput) {
    const instructor: Instructor = {
      id: id(),
      fullName: input.fullName,
      avatar: null,
      jobTitle: input.jobTitle,
      linkedinUrl: input.linkedinUrl,
      company: input.company,
      companyLogo: null,
      bio: input.bio,
    };
    db().instructors.unshift(instructor);
    return instructor;
  },

  updateInstructor(instructorId: number, input: InstructorInput) {
    const instructor = this.getInstructor(instructorId);
    if (!instructor) throw new Error("مدرس پیدا نشد.");
    Object.assign(instructor, input);
    return instructor;
  },

  deleteInstructor(instructorId: number) {
    db().instructors = db().instructors.filter((item) => item.id !== instructorId);
  },

  listBlog(params: { search?: string } = {}) {
    return db().blogPosts.filter((item) => matches(`${item.title} ${item.excerpt}`, params.search));
  },

  getBlog(postId: number) {
    return db().blogPosts.find((item) => item.id === postId) ?? null;
  },

  createBlog(input: BlogPostInput) {
    const category = db().blogCategories.find((item) => item.id === input.categoryId);
    const post: BlogPost = {
      id: id(),
      title: input.title,
      slug: input.slug,
      authorId: 99,
      authorName: "مدیر کلاسور",
      categoryId: input.categoryId,
      categoryTitle: category?.title ?? "عمومی",
      excerpt: input.excerpt,
      content: input.content,
      banner: "",
      status: input.status,
      publishedAt: input.status === BLOG_STATUS.PUBLISHED ? new Date().toISOString() : null,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    db().blogPosts.unshift(post);
    return post;
  },

  updateBlog(postId: number, input: Partial<BlogPostInput>) {
    const post = this.getBlog(postId);
    if (!post) throw new Error("پست پیدا نشد.");
    Object.assign(post, input);
    if (input.categoryId) {
      post.categoryTitle =
        db().blogCategories.find((item) => item.id === input.categoryId)?.title ??
        post.categoryTitle;
    }
    if (input.status === BLOG_STATUS.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date().toISOString();
    }
    return post;
  },

  deleteBlog(postId: number) {
    db().blogPosts = db().blogPosts.filter((item) => item.id !== postId);
  },

  moderateComment(postId: number, commentId: number, approved: boolean) {
    const post = this.getBlog(postId);
    if (!post) throw new Error("پست پیدا نشد.");
    const comment = post.comments.find((item) => item.id === commentId);
    if (!comment) throw new Error("کامنت پیدا نشد.");
    comment.approved = approved;
    return post;
  },

  listTopics() {
    return db().topics;
  },

  createTopic(input: TopicInput) {
    const topic = { id: id(), title: input.title };
    db().topics.push(topic);
    return topic;
  },

  updateTopic(topicId: number, input: TopicInput) {
    const topic = db().topics.find((item) => item.id === topicId);
    if (!topic) throw new Error("موضوع پیدا نشد.");
    topic.title = input.title;
    return topic;
  },

  deleteTopic(topicId: number) {
    db().topics = db().topics.filter((item) => item.id !== topicId);
  },

  listSponsors() {
    return db().sponsors;
  },

  createSponsor(input: SponsorInput) {
    const sponsor: Sponsor = { id: id(), ...input };
    db().sponsors.push(sponsor);
    return sponsor;
  },

  updateSponsor(sponsorId: number, input: SponsorInput) {
    const sponsor = db().sponsors.find((item) => item.id === sponsorId);
    if (!sponsor) throw new Error("حامی پیدا نشد.");
    Object.assign(sponsor, input);
    return sponsor;
  },

  deleteSponsor(sponsorId: number) {
    db().sponsors = db().sponsors.filter((item) => item.id !== sponsorId);
  },

  blogCategories() {
    return db().blogCategories;
  },
};
