import {
  BLOG_STATUS,
  CALL_OUTCOME,
  ENROLLMENT_STATUS,
  NEXT_STEP_BY,
  eventStatusLabels,
  type AdminUser,
  type AppSettings,
  type BlogCategory,
  type BlogPost,
  type BlogPostInput,
  type Bootcamp,
  type BootcampInput,
  type CallOutcome,
  type Certificate,
  type CustomerActivity,
  type CustomerCall,
  type CustomerDetail,
  type CustomerListItem,
  type CustomerNote,
  type DashboardStats,
  type Enrollment,
  type EnrollmentStatus,
  type Instructor,
  type InstructorInput,
  type ListParams,
  type PartnerCompany,
  type PartnerCompanyInput,
  type Payment,
  type Sponsor,
  type SponsorInput,
  type Topic,
  type TopicInput,
  type UserUpdateInput,
} from "@/lib/api/types";
import {
  appSettings as seedSettings,
  blogCategories as seedCategories,
  blogPosts as seedPosts,
  bootcamps as seedBootcamps,
  callOutcomeLabels,
  certificates as seedCertificates,
  customerCalls as seedCalls,
  customerNotes as seedNotes,
  enrollments as seedEnrollments,
  instructors as seedInstructors,
  partnerCompanies as seedPartners,
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
  partners: PartnerCompany[];
  bootcamps: Bootcamp[];
  users: AdminUser[];
  enrollments: Enrollment[];
  payments: Payment[];
  certificates: Certificate[];
  settings: AppSettings;
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
    partners: clone(seedPartners),
    bootcamps: clone(seedBootcamps),
    users: clone(seedUsers),
    enrollments: clone(seedEnrollments),
    payments: clone(seedPayments),
    certificates: clone(seedCertificates),
    settings: clone(seedSettings),
    customerNotes: clone(seedNotes),
    customerCalls: clone(seedCalls),
    blogCategories: clone(seedCategories),
    blogPosts: clone(seedPosts),
    nextId: 1000,
  };
}

const globalStore = globalThis as typeof globalThis & {
  __kelaasorAdminStoreV5?: Store;
};

function db() {
  if (!globalStore.__kelaasorAdminStoreV5) {
    globalStore.__kelaasorAdminStoreV5 = createStore();
  }
  return globalStore.__kelaasorAdminStoreV5;
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

function startOfDay(value = new Date()) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function followUpState(followUpAt: string | null): CustomerListItem["followUpState"] {
  if (!followUpAt) return "none";
  const target = startOfDay(new Date(followUpAt));
  const today = startOfDay();
  const diff = target.getTime() - today.getTime();
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return "upcoming";
}

function isColdCustomer(item: CustomerListItem) {
  if (item.activeEnrollmentStatus === ENROLLMENT_STATUS.CONFIRMED) return false;
  if (item.activeEnrollmentStatus === ENROLLMENT_STATUS.CANCELED) return false;
  const last = item.lastActivityAt ? new Date(item.lastActivityAt).getTime() : 0;
  const week = 7 * 86_400_000;
  return Date.now() - last > week;
}

function buildActivity(userId: number): CustomerActivity[] {
  const store = db();
  const activities: CustomerActivity[] = [];

  for (const note of store.customerNotes.filter((item) => item.userId === userId)) {
    activities.push({
      id: `note-${note.id}`,
      kind: "note",
      title: "یادداشت ادمین",
      body: note.body,
      at: note.createdAt,
      meta: note.authorName,
    });
  }

  for (const call of store.customerCalls.filter((item) => item.userId === userId)) {
    activities.push({
      id: `call-${call.id}`,
      kind: "call",
      title: `تماس — ${call.outcomeLabel}`,
      body: call.summary,
      at: call.calledAt,
      meta:
        call.durationMinutes != null
          ? `${call.durationMinutes} دقیقه · ${call.authorName}`
          : call.authorName,
    });
  }

  for (const enrollment of store.enrollments.filter((item) => item.userId === userId)) {
    const bootcamp = store.bootcamps.find((b) => b.id === enrollment.bootcampId);
    activities.push({
      id: `enr-${enrollment.id}`,
      kind: "enrollment",
      title: `ثبت‌نام: ${bootcamp?.title ?? "بوت‌کمپ"}`,
      body: enrollment.notes
        ? `${enrollment.statusLabel} — ${enrollment.notes}`
        : `وضعیت: ${enrollment.statusLabel} · گام بعدی: ${enrollment.nextStepByDisplay}`,
      at: enrollment.enrolledAt,
      meta: enrollment.statusLabel,
    });
  }

  const user = store.users.find((item) => item.id === userId);
  if (user?.followUpAt) {
    activities.push({
      id: `fu-${userId}`,
      kind: "followup",
      title: "یادآوری پیگیری",
      body:
        followUpState(user.followUpAt) === "overdue"
          ? "پیگیری از موعد گذشته است."
          : followUpState(user.followUpAt) === "today"
            ? "پیگیری برای امروز تنظیم شده است."
            : "پیگیری برنامه‌ریزی‌شده.",
      at: new Date(user.followUpAt).toISOString(),
      meta: followUpState(user.followUpAt),
    });
  }

  return activities.sort((a, b) => +new Date(b.at) - +new Date(a.at));
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
  const activityDates = [
    ...notes.map((item) => item.createdAt),
    ...calls.map((item) => item.calledAt),
    ...enrollments.map((item) => item.enrolledAt),
  ]
    .map((value) => +new Date(value))
    .filter((value) => Number.isFinite(value));
  const lastActivityAt =
    activityDates.length > 0
      ? new Date(Math.max(...activityDates)).toISOString()
      : user.createdAt;

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
    lastActivityAt,
    followUpState: followUpState(user.followUpAt),
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

    const allCustomers = store.users.filter((u) => !u.isStaff).map(toCustomerListItem);
    const priorityCustomers = allCustomers
      .filter(
        (item) =>
          item.activeEnrollmentStatus === ENROLLMENT_STATUS.THINKING ||
          item.activeEnrollmentStatus === ENROLLMENT_STATUS.NO_ANSWER ||
          item.activeEnrollmentStatus ===
            ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION ||
          item.activeEnrollmentStatus === ENROLLMENT_STATUS.INITIAL,
      )
      .slice(0, 6);
    const followUpCustomers = allCustomers
      .filter((item) => item.followUpState === "today" || item.followUpState === "overdue")
      .sort((a, b) => {
        const rank = { overdue: 0, today: 1, upcoming: 2, none: 3 } as const;
        return rank[a.followUpState] - rank[b.followUpState];
      })
      .slice(0, 6);
    const coldCustomers = allCustomers.filter(isColdCustomer).slice(0, 6);
    const starredCustomers = allCustomers.filter((item) => item.isStarred).slice(0, 6);

    const todayTasks = [
      ...followUpCustomers.slice(0, 3).map((item) => ({
        id: `fu-${item.id}`,
        title: `پیگیری ${item.firstName} ${item.lastName}`,
        meta: item.followUpState === "overdue" ? "از موعد گذشته" : "یادآوری امروز",
        href: routes.customer(item.id),
        done: false,
      })),
      ...pendingAdmin.slice(0, 3).map((item) => {
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
    ].slice(0, 8);

    return {
      totalUsers: allCustomers.length,
      activeBootcamps: store.bootcamps.filter((b) => b.currentEvent).length,
      pendingAdminActions: pendingAdmin.length,
      awaitingPaymentVerification: awaitingPay.length,
      awaitingCounselorCall: awaitingCall.length,
      confirmedThisMonth,
      estimatedRevenue,
      collectedRevenue,
      unpaidAmount,
      adminQueueProgress,
      starredCount: allCustomers.filter((item) => item.isStarred).length,
      overdueFollowUpsCount: allCustomers.filter((item) => item.followUpState === "overdue").length,
      todayFollowUpsCount: allCustomers.filter((item) => item.followUpState === "today").length,
      coldCustomersCount: allCustomers.filter(isColdCustomer).length,
      certificatesToIssue: store.enrollments.filter(
        (item) =>
          item.status === ENROLLMENT_STATUS.CONFIRMED &&
          !store.certificates.some((c) => c.enrollmentId === item.id && !c.revoked),
      ).length,
      pendingBlogComments: store.blogPosts.reduce(
        (sum, post) => sum + post.comments.filter((c) => !c.approved).length,
        0,
      ),
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
      followUpCustomers,
      coldCustomers,
      starredCustomers,
      quickLinks: [
        {
          id: "customers",
          title: "همه مشتریان",
          description: "پروفایل، یادداشت و تماس‌ها",
          href: routes.customers,
          count: allCustomers.length,
        },
        {
          id: "followups",
          title: "پیگیری‌های امروز",
          description: "یادآوری و موارد از موعد گذشته",
          href: `${routes.customers}?crm=followup`,
          count: followUpCustomers.length,
        },
        {
          id: "payments",
          title: "تأیید پرداخت",
          description: "فیش و چک در انتظار بررسی",
          href: `${routes.payments}?filter=awaiting`,
          count: awaitingPay.length,
        },
        {
          id: "certificates",
          title: "گواهی‌های قابل صدور",
          description: "ثبت‌نام‌های تأییدشده بدون گواهی",
          href: routes.certificates,
          count: store.enrollments.filter(
            (item) =>
              item.status === ENROLLMENT_STATUS.CONFIRMED &&
              !store.certificates.some((c) => c.enrollmentId === item.id && !c.revoked),
          ).length,
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
    if (status === ENROLLMENT_STATUS.CONFIRMED) {
      this.ensureCertificateForEnrollment(item.id);
    }
    return item;
  },

  listPayments(params: { search?: string; paymentFilter?: ListParams["paymentFilter"] } = {}) {
    const store = db();
    return store.payments.filter((item) => {
      const user = store.users.find((u) => u.id === item.userId);
      const bootcamp = store.bootcamps.find((b) => b.id === item.bootcampId);
      if (
        !matches(
          `${user?.firstName} ${user?.lastName} ${bootcamp?.title} ${item.paymentStatus}`,
          params.search,
        )
      ) {
        return false;
      }
      if (params.paymentFilter === "awaiting") {
        return (
          (!item.verified && Boolean(item.receipt)) ||
          item.installments.some((row) => row.awaitingVerification)
        );
      }
      if (params.paymentFilter === "installment") {
        return item.paymentType === 2;
      }
      return true;
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
      payment.receipt = null;
      payment.cheque = null;
      payment.chequeNumber = null;
      payment.paidPercentage = 0;
      payment.paidAmount = 0;
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
    installment.awaitingVerification = false;
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
    } else if (payment.installments.some((row) => row.awaitingVerification)) {
      payment.paymentStatus = "در انتظار تأیید قسط";
    }
    return payment;
  },

  rejectInstallmentReceipt(paymentId: number, installmentId: number) {
    const payment = this.getPayment(paymentId);
    if (!payment) throw new Error("پرداخت پیدا نشد.");
    const installment = payment.installments.find((row) => row.id === installmentId);
    if (!installment) throw new Error("قسط پیدا نشد.");
    installment.paymentReceipt = null;
    installment.awaitingVerification = false;
    installment.isPaid = false;
    installment.paidAt = null;
    payment.paymentStatus = "در انتظار رسید قسط";
    return payment;
  },

  ensureCertificateForEnrollment(enrollmentId: number) {
    const enrollment = this.getEnrollment(enrollmentId);
    if (!enrollment || enrollment.status !== ENROLLMENT_STATUS.CONFIRMED) return null;
    const existing = db().certificates.find(
      (item) => item.enrollmentId === enrollmentId && !item.revoked,
    );
    if (existing) return existing;
    const bootcamp = this.getBootcamp(enrollment.bootcampId);
    const cert: Certificate = {
      id: id(),
      userId: enrollment.userId,
      enrollmentId: enrollment.id,
      bootcampId: enrollment.bootcampId,
      title: `گواهی ${bootcamp?.title ?? "بوت‌کمپ"}`,
      banner: bootcamp?.banner ?? null,
      issuedAt: new Date().toISOString(),
      revoked: false,
    };
    db().certificates.unshift(cert);
    return cert;
  },

  listCertificates(params: { search?: string } = {}) {
    const store = db();
    return store.certificates
      .filter((item) => {
        const user = store.users.find((u) => u.id === item.userId);
        const bootcamp = store.bootcamps.find((b) => b.id === item.bootcampId);
        return matches(
          `${user?.firstName} ${user?.lastName} ${bootcamp?.title} ${item.title}`,
          params.search,
        );
      })
      .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
  },

  getCertificate(certificateId: number) {
    return db().certificates.find((item) => item.id === certificateId) ?? null;
  },

  issueCertificate(enrollmentId: number) {
    const enrollment = this.getEnrollment(enrollmentId);
    if (!enrollment) throw new Error("ثبت‌نام پیدا نشد.");
    if (enrollment.status !== ENROLLMENT_STATUS.CONFIRMED) {
      throw new Error("فقط برای ثبت‌نام تأییدشده می‌توان گواهی صادر کرد.");
    }
    return this.ensureCertificateForEnrollment(enrollmentId)!;
  },

  revokeCertificate(certificateId: number) {
    const cert = this.getCertificate(certificateId);
    if (!cert) throw new Error("گواهی پیدا نشد.");
    cert.revoked = true;
    return cert;
  },

  getSettings() {
    return db().settings;
  },

  updateSettings(patch: Partial<AppSettings>) {
    Object.assign(db().settings, patch);
    return db().settings;
  },

  listBootcamps(params: { search?: string } = {}) {
    return db().bootcamps.filter((item) => matches(`${item.title} ${item.brief}`, params.search));
  },

  getBootcamp(bootcampId: number) {
    return db().bootcamps.find((item) => item.id === bootcampId) ?? null;
  },

  createBootcamp(input: BootcampInput) {
    const store = db();
    const status = input.eventStatus ?? 1;
    const bootcamp: Bootcamp = {
      id: id(),
      title: input.title,
      slug: input.slug,
      brief: input.brief,
      description: input.description,
      banner: input.banner,
      durationInWeeks: input.durationInWeeks,
      capacity: input.capacity,
      ordering: store.bootcamps.length + 1,
      hasBnpl: input.hasBnpl,
      installmentCount: input.installmentCount ?? store.settings.defaultInstallmentCount,
      topicId: input.topicId,
      instructorIds: input.instructorIds ?? [],
      sponsorIds: input.sponsorIds ?? [],
      chapters: [],
      medias: [],
      currentEvent: {
        id: id(),
        status,
        statusDisplay: eventStatusLabels[status] ?? "در حال ثبت‌نام",
        totalEnrollmentsCount: 0,
        confirmedEnrollmentsCount: 0,
        startDate: input.startDate,
        endDate: input.endDate,
        sessionsScheduleDays: input.sessionsScheduleDays,
        sessionsScheduleHours: input.sessionsScheduleHours,
        primaryPrice: input.primaryPrice,
        finalPrice: input.finalPrice,
        capacity: input.capacity,
        registrationDeadline: input.registrationDeadline || input.startDate,
      },
    };
    store.bootcamps.unshift(bootcamp);
    return bootcamp;
  },

  updateBootcamp(bootcampId: number, input: Partial<BootcampInput> & Partial<Bootcamp>) {
    const bootcamp = this.getBootcamp(bootcampId);
    if (!bootcamp) throw new Error("بوت‌کمپ پیدا نشد.");
    if (input.title != null) bootcamp.title = input.title;
    if (input.slug != null) bootcamp.slug = input.slug;
    if (input.brief != null) bootcamp.brief = input.brief;
    if (input.description != null) bootcamp.description = input.description;
    if (input.durationInWeeks != null) bootcamp.durationInWeeks = input.durationInWeeks;
    if (input.capacity != null) bootcamp.capacity = input.capacity;
    if (input.topicId != null) bootcamp.topicId = input.topicId;
    if (input.hasBnpl != null) bootcamp.hasBnpl = input.hasBnpl;
    if (input.installmentCount != null) bootcamp.installmentCount = input.installmentCount;
    if (input.banner !== undefined) bootcamp.banner = input.banner;
    if (input.instructorIds) bootcamp.instructorIds = input.instructorIds;
    if (input.sponsorIds) bootcamp.sponsorIds = input.sponsorIds;
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
      if (input.registrationDeadline) {
        bootcamp.currentEvent.registrationDeadline = input.registrationDeadline;
      }
      if (input.eventStatus != null) {
        bootcamp.currentEvent.status = input.eventStatus;
        bootcamp.currentEvent.statusDisplay =
          eventStatusLabels[input.eventStatus] ?? bootcamp.currentEvent.statusDisplay;
      }
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

  listCustomers(
    params: { search?: string; status?: number | string; crmFilter?: ListParams["crmFilter"] } = {},
  ): CustomerListItem[] {
    return this.listUsers(params)
      .filter((item) => !item.isStaff)
      .map(toCustomerListItem)
      .filter((item) => {
        if (params.status !== undefined && params.status !== "") {
          if (item.activeEnrollmentStatus !== Number(params.status)) return false;
        }
        switch (params.crmFilter) {
          case "starred":
            return item.isStarred;
          case "followup":
            return item.followUpState === "today" || item.followUpState === "overdue";
          case "overdue":
            return item.followUpState === "overdue";
          case "cold":
            return isColdCustomer(item);
          default:
            return true;
        }
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
      activity: buildActivity(userId),
    };
  },

  toggleCustomerStar(userId: number) {
    const user = this.getUser(userId);
    if (!user || user.isStaff) throw new Error("مشتری پیدا نشد.");
    user.isStarred = !user.isStarred;
    return user;
  },

  setCustomerFollowUp(userId: number, followUpAt: string | null) {
    const user = this.getUser(userId);
    if (!user || user.isStaff) throw new Error("مشتری پیدا نشد.");
    user.followUpAt = followUpAt;
    return user;
  },

  setCustomerTags(userId: number, crmTags: string[]) {
    const user = this.getUser(userId);
    if (!user || user.isStaff) throw new Error("مشتری پیدا نشد.");
    user.crmTags = crmTags.map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
    return user;
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

  updateUser(userId: number, patch: UserUpdateInput) {
    const user = this.getUser(userId);
    if (!user) throw new Error("کاربر پیدا نشد.");
    const { profile, ...rest } = patch;
    Object.assign(user, rest);
    if (profile) Object.assign(user.profile, profile);
    return user;
  },

  setBootcampChapters(
    bootcampId: number,
    chapters: Bootcamp["chapters"],
  ) {
    const bootcamp = this.getBootcamp(bootcampId);
    if (!bootcamp) throw new Error("بوت‌کمپ پیدا نشد.");
    bootcamp.chapters = chapters.map((chapter, index) => ({
      ...chapter,
      ordering: index + 1,
      lessons: chapter.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        ordering: lessonIndex + 1,
      })),
    }));
    return bootcamp;
  },

  setBootcampMedias(bootcampId: number, medias: Bootcamp["medias"]) {
    const bootcamp = this.getBootcamp(bootcampId);
    if (!bootcamp) throw new Error("بوت‌کمپ پیدا نشد.");
    bootcamp.medias = medias;
    return bootcamp;
  },

  listPartners() {
    return db().partners;
  },

  createPartner(input: PartnerCompanyInput) {
    const partner: PartnerCompany = { id: id(), ...input };
    db().partners.push(partner);
    return partner;
  },

  updatePartner(partnerId: number, input: PartnerCompanyInput) {
    const partner = db().partners.find((item) => item.id === partnerId);
    if (!partner) throw new Error("شرکت همکار پیدا نشد.");
    Object.assign(partner, input);
    return partner;
  },

  deletePartner(partnerId: number) {
    db().partners = db().partners.filter((item) => item.id !== partnerId);
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
      avatar: input.avatar || null,
      jobTitle: input.jobTitle,
      linkedinUrl: input.linkedinUrl,
      company: input.company,
      companyLogo: input.companyLogo || null,
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
      banner: input.banner || "",
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
