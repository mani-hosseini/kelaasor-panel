export const ENROLLMENT_STATUS = {
  CANCELED: -1,
  INITIAL: 10,
  THINKING: 20,
  WAITING_FOR_COMPLETE_INFORMATION: 30,
  WAITING_FOR_PAYMENT_RECEIPT: 40,
  WAITING_FOR_PAYMENT_VERIFICATION: 50,
  CONFIRMED: 60,
} as const;

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
  mediaType: "file" | "video";
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

export type DashboardStats = {
  totalUsers: number;
  activeBootcamps: number;
  pendingAdminActions: number;
  awaitingPaymentVerification: number;
  confirmedThisMonth: number;
  estimatedRevenue: number;
  collectedRevenue: number;
  funnel: { status: EnrollmentStatus; label: string; count: number }[];
  weeklyEnrollments: { week: string; count: number }[];
  recentEnrollments: Enrollment[];
};

export type ListParams = {
  search?: string;
  status?: number | string;
  bootcampId?: number;
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
  primaryPrice: number;
  finalPrice: number;
  startDate: string;
  endDate: string;
  sessionsScheduleDays: string;
  sessionsScheduleHours: string;
};

export type InstructorInput = {
  fullName: string;
  jobTitle: string;
  linkedinUrl: string;
  company: string;
  bio: string;
};

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number;
  status: number;
};

export type TopicInput = { title: string };
export type SponsorInput = { name: string; website: string; logo: string };
