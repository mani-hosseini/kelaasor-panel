export const ENROLLMENT_STATUS = {
  CANCELED: -1,
  INITIAL: 10,
  THINKING: 20,
  NO_ANSWER: 25,
  WAITING_FOR_COMPLETE_INFORMATION: 30,
  WAITING_FOR_PAYMENT_RECEIPT: 40,
  WAITING_FOR_PAYMENT_VERIFICATION: 50,
  CONFIRMED: 60,
} as const;

/** Ordered funnel stages shown in customer CRM (excludes canceled). */
export const ENROLLMENT_PIPELINE: EnrollmentStatus[] = [
  ENROLLMENT_STATUS.INITIAL,
  ENROLLMENT_STATUS.THINKING,
  ENROLLMENT_STATUS.NO_ANSWER,
  ENROLLMENT_STATUS.WAITING_FOR_COMPLETE_INFORMATION,
  ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_RECEIPT,
  ENROLLMENT_STATUS.WAITING_FOR_PAYMENT_VERIFICATION,
  ENROLLMENT_STATUS.CONFIRMED,
];

export const CALL_OUTCOME = {
  ANSWERED: "answered",
  NO_ANSWER: "no_answer",
  CALLBACK: "callback",
  BUSY: "busy",
} as const;

export type CallOutcome = (typeof CALL_OUTCOME)[keyof typeof CALL_OUTCOME];

export type EnrollmentStatus =
  (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

export const NEXT_STEP_BY = {
  ADMIN: 1,
  USER: 2,
} as const;

export const PAYMENT_TYPE = {
  CASH: 1,
  INSTALLMENT: 2,
} as const;

export const EDUCATION_LEVEL = {
  DIPLOMA: 1,
  ASSOCIATE: 2,
  BACHELOR: 3,
  MASTER: 4,
  DOCTORATE: 5,
} as const;

export const BLOG_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
} as const;

export type Topic = {
  id: number;
  title: string;
};

export type Instructor = {
  id: number;
  fullName: string;
  avatar: string | null;
  jobTitle: string;
  linkedinUrl: string;
  company: string | null;
  companyLogo: string | null;
  bio: string;
};

export type Sponsor = {
  id: number;
  name: string;
  logo: string;
  website: string;
};

export type BootcampLesson = {
  id: number;
  title: string;
  ordering: number;
};

export type BootcampChapter = {
  id: number;
  title: string;
  ordering: number;
  lessons: BootcampLesson[];
};

export type BootcampMedia = {
  id: number;
  title: string;
  mediaType: "file" | "video" | "image";
  file: string;
};

export type BootcampEvent = {
  id: number;
  status: number;
  statusDisplay: string;
  totalEnrollmentsCount: number;
  confirmedEnrollmentsCount: number;
  startDate: string;
  endDate: string;
  sessionsScheduleDays: string;
  sessionsScheduleHours: string;
  primaryPrice: number | null;
  finalPrice: number;
  capacity: number;
  registrationDeadline: string;
};

export type Bootcamp = {
  id: number;
  title: string;
  slug: string;
  brief: string;
  description: string;
  banner: string | null;
  durationInWeeks: number;
  capacity: number;
  ordering: number;
  hasBnpl: boolean;
  installmentCount: number;
  topicId: number;
  instructorIds: number[];
  sponsorIds: number[];
  chapters: BootcampChapter[];
  medias: BootcampMedia[];
  currentEvent: BootcampEvent | null;
};

export type UserProfile = {
  birthDate: string | null;
  nationalId: string | null;
  englishFirstName: string | null;
  englishLastName: string | null;
  email: string | null;
  address: string | null;
  linkedinUrl: string | null;
  educationLevel: number | null;
  educationLevelDisplay: string | null;
  fieldOfStudy: string | null;
  hasPriorExperience: boolean;
  experienceDescription: string | null;
};

export type AdminUser = {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: number | null;
  genderDisplay: string;
  role: "student" | "staff";
  isStaff: boolean;
  isActive: boolean;
  createdAt: string;
  profile: UserProfile;
  /** Marked for quick access on dashboard. */
  isStarred: boolean;
  /** Next scheduled admin follow-up (ISO). */
  followUpAt: string | null;
  /** Lightweight CRM labels e.g. VIP, اقساط. */
  crmTags: string[];
};

export type CustomerActivityKind = "note" | "call" | "enrollment" | "followup";

export type CustomerActivity = {
  id: string;
  kind: CustomerActivityKind;
  title: string;
  body: string;
  at: string;
  meta?: string;
};

/** Free-form admin notes on a customer (not tied to enrollment status). */
export type CustomerNote = {
  id: number;
  userId: number;
  body: string;
  authorName: string;
  createdAt: string;
};

/** Dated call / conversation log with a customer. */
export type CustomerCall = {
  id: number;
  userId: number;
  enrollmentId: number | null;
  calledAt: string;
  durationMinutes: number | null;
  outcome: CallOutcome;
  outcomeLabel: string;
  summary: string;
  authorName: string;
};

export type CustomerListItem = AdminUser & {
  enrollmentCount: number;
  activeEnrollmentStatus: EnrollmentStatus | null;
  activeEnrollmentLabel: string | null;
  activeBootcampTitle: string | null;
  notesCount: number;
  callsCount: number;
  lastCallAt: string | null;
  lastActivityAt: string | null;
  followUpState: "none" | "upcoming" | "today" | "overdue";
};

export type CustomerDetail = {
  user: AdminUser;
  enrollments: Enrollment[];
  notes: CustomerNote[];
  calls: CustomerCall[];
  activity: CustomerActivity[];
};

export type Enrollment = {
  id: number;
  userId: number;
  bootcampId: number;
  status: EnrollmentStatus;
  statusLabel: string;
  nextStepBy: number;
  nextStepByDisplay: string;
  enrolledAt: string;
  notes: string | null;
  paymentId: number | null;
};

export type PaymentInstallment = {
  id: number;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt: string | null;
  paymentReceipt: string | null;
  /** When receipt uploaded but admin has not approved yet. */
  awaitingVerification: boolean;
};

export type Payment = {
  id: number;
  enrollmentId: number;
  userId: number;
  bootcampId: number;
  paymentType: 1 | 2;
  paymentStatus: string;
  paidPercentage: number;
  totalAmount: number;
  paidAmount: number;
  receipt: string | null;
  cheque: string | null;
  chequeNumber: string | null;
  verified: boolean;
  installments: PaymentInstallment[];
};

export type Certificate = {
  id: number;
  userId: number;
  enrollmentId: number;
  bootcampId: number;
  title: string;
  banner: string | null;
  issuedAt: string;
  revoked: boolean;
};

export type AppSettings = {
  bankCardNumber: string;
  bankSheba: string;
  bankOwnerName: string;
  bankName: string;
  lmsUrl: string;
  defaultInstallmentCount: number;
};

export type BlogComment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  text: string;
  createdAt: string;
  approved: boolean;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  authorId: number;
  authorName: string;
  categoryId: number;
  categoryTitle: string;
  excerpt: string;
  content: string;
  banner: string;
  status: number;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
  comments: BlogComment[];
};

export type BlogCategory = {
  id: number;
  title: string;
  slug: string;
};

export type DashboardQuickLink = {
  id: string;
  title: string;
  description: string;
  href: string;
  count: number;
};

export type DashboardTaskItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
  done: boolean;
};

export type DashboardStats = {
  totalUsers: number;
  activeBootcamps: number;
  pendingAdminActions: number;
  awaitingPaymentVerification: number;
  awaitingCounselorCall: number;
  confirmedThisMonth: number;
  estimatedRevenue: number;
  collectedRevenue: number;
  unpaidAmount: number;
  adminQueueProgress: number;
  starredCount: number;
  overdueFollowUpsCount: number;
  todayFollowUpsCount: number;
  coldCustomersCount: number;
  certificatesToIssue: number;
  pendingBlogComments: number;
  funnel: { status: EnrollmentStatus; label: string; count: number }[];
  weeklyEnrollments: { week: string; count: number }[];
  recentEnrollments: Enrollment[];
  priorityCustomers: CustomerListItem[];
  followUpCustomers: CustomerListItem[];
  coldCustomers: CustomerListItem[];
  starredCustomers: CustomerListItem[];
  quickLinks: DashboardQuickLink[];
  todayTasks: DashboardTaskItem[];
  recentCalls: CustomerCall[];
};

export type ListParams = {
  search?: string;
  status?: number | string;
  bootcampId?: number;
  /** CRM list filters */
  crmFilter?: "all" | "starred" | "followup" | "overdue" | "cold";
  /** Payment queue: awaiting | all */
  paymentFilter?: "all" | "awaiting" | "installment";
};

export const EVENT_STATUS = {
  PRE_REGISTERING: 0,
  REGISTERING: 1,
  ONGOING: 2,
  COMPLETED: 3,
} as const;

export const eventStatusLabels: Record<number, string> = {
  0: "پیش‌ثبت‌نام",
  1: "در حال ثبت‌نام",
  2: "در حال برگزاری",
  3: "پایان‌یافته",
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "staff";
};

export type BootcampInput = {
  title: string;
  slug: string;
  brief: string;
  description: string;
  durationInWeeks: number;
  capacity: number;
  topicId: number;
  hasBnpl: boolean;
  installmentCount: number;
  banner: string | null;
  instructorIds: number[];
  sponsorIds: number[];
  primaryPrice: number;
  finalPrice: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  eventStatus: number;
  sessionsScheduleDays: string;
  sessionsScheduleHours: string;
};

export type InstructorInput = {
  fullName: string;
  jobTitle: string;
  linkedinUrl: string;
  company: string;
  bio: string;
  avatar: string | null;
  companyLogo: string | null;
};

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number;
  status: number;
  banner: string;
};

export type TopicInput = { title: string };
export type SponsorInput = { name: string; website: string; logo: string };

/** Home-page partner logos (camp `/courses/partner-companies`). */
export type PartnerCompany = {
  id: number;
  name: string;
  logo: string;
  website: string;
};

export type PartnerCompanyInput = {
  name: string;
  logo: string;
  website: string;
};

export type UserUpdateInput = {
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: number | null;
  genderDisplay?: string;
  profile?: Partial<UserProfile>;
};
