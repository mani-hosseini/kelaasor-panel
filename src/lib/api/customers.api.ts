import { apiRequest } from "@/lib/api/http";
import {
  callOutcomeLabel,
  educationLevelLabel,
  enrollmentStatusLabel,
} from "@/lib/api/labels";
import {
  asBool,
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import {
  CALL_OUTCOME,
  ENROLLMENT_STATUS,
  type AdminUser,
  type CallOutcome,
  type CustomerActivity,
  type CustomerActivityKind,
  type CustomerCall,
  type CustomerDetail,
  type CustomerListItem,
  type CustomerNote,
  type Enrollment,
  type EnrollmentStatus,
  type ListParams,
  type UserProfile,
  type UserUpdateInput,
} from "@/lib/api/types";

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function followUpState(
  followUpAt: string | null,
): CustomerListItem["followUpState"] {
  if (!followUpAt) return "none";
  const target = startOfDay(new Date(followUpAt));
  const today = startOfDay();
  const diff = target.getTime() - today.getTime();
  if (Number.isNaN(diff)) return "none";
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

function normalizeProfile(raw: unknown): UserProfile {
  if (!isObj(raw)) {
    return {
      birthDate: null,
      nationalId: null,
      englishFirstName: null,
      englishLastName: null,
      email: null,
      address: null,
      linkedinUrl: null,
      educationLevel: null,
      educationLevelDisplay: null,
      fieldOfStudy: null,
      hasPriorExperience: false,
      experienceDescription: null,
    };
  }

  const educationLevel = asNum(raw.education_level) ?? asNum(raw.educationLevel);
  const educationLevelDisplay =
    asStr(raw.education_level_display) ??
    asStr(raw.educationLevelDisplay) ??
    (educationLevel != null ? educationLevelLabel(educationLevel) : null);

  return {
    birthDate: asStr(raw.birth_date) ?? asStr(raw.birthDate),
    nationalId: asStr(raw.national_id) ?? asStr(raw.nationalId),
    englishFirstName:
      asStr(raw.english_first_name) ?? asStr(raw.englishFirstName),
    englishLastName: asStr(raw.english_last_name) ?? asStr(raw.englishLastName),
    email: asStr(raw.email),
    address: asStr(raw.address),
    linkedinUrl: asStr(raw.linkedin_url) ?? asStr(raw.linkedinUrl),
    educationLevel,
    educationLevelDisplay,
    fieldOfStudy: asStr(raw.field_of_study) ?? asStr(raw.fieldOfStudy),
    hasPriorExperience: asBool(
      raw.has_prior_experience ?? raw.hasPriorExperience,
    ),
    experienceDescription:
      asStr(raw.experience_description) ?? asStr(raw.experienceDescription),
  };
}

function normalizeCrmTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asStr(entry))
      .filter((entry): entry is string => entry != null)
      .slice(0, 6);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 6);
  }
  return [];
}

function normalizeUser(item: unknown): AdminUser | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  if (id == null) return null;

  const roleRaw = (asStr(item.role) ?? "").toLowerCase();
  const isStaff = asBool(item.is_staff ?? item.isStaff) || roleRaw === "staff";
  const followUpAt =
    asStr(item.follow_up_at) ?? asStr(item.followUpAt) ?? null;

  return {
    id,
    phoneNumber: asStr(item.phone_number) ?? asStr(item.phoneNumber) ?? "",
    firstName: asStr(item.first_name) ?? asStr(item.firstName) ?? "",
    lastName: asStr(item.last_name) ?? asStr(item.lastName) ?? "",
    email: asStr(item.email) ?? "",
    gender: asNum(item.gender),
    genderDisplay: asStr(item.gender_display) ?? asStr(item.genderDisplay) ?? "",
    role: isStaff ? "staff" : "student",
    isStaff,
    isActive: item.is_active === undefined && item.isActive === undefined
      ? true
      : asBool(item.is_active ?? item.isActive),
    createdAt: asStr(item.created_at) ?? asStr(item.createdAt) ?? "",
    profile: normalizeProfile(item.profile),
    isStarred: asBool(item.is_starred ?? item.isStarred),
    followUpAt,
    crmTags: normalizeCrmTags(item.crm_tags ?? item.crmTags),
  };
}

export function normalizeCustomerListItem(item: unknown): CustomerListItem | null {
  const user = normalizeUser(item);
  if (!user || user.isStaff) return null;
  if (!isObj(item)) return null;

  const activeStatus =
    asNum(item.active_enrollment_status) ?? asNum(item.activeEnrollmentStatus);
  const activeEnrollmentStatus =
    activeStatus == null ? null : (activeStatus as EnrollmentStatus);
  const activeEnrollmentLabel =
    asStr(item.active_enrollment_label) ??
    asStr(item.activeEnrollmentLabel) ??
    (activeEnrollmentStatus != null
      ? enrollmentStatusLabel(activeEnrollmentStatus)
      : null);

  return {
    ...user,
    enrollmentCount:
      asNum(item.enrollment_count) ?? asNum(item.enrollmentCount) ?? 0,
    activeEnrollmentStatus,
    activeEnrollmentLabel,
    activeBootcampTitle:
      asStr(item.active_bootcamp_title) ?? asStr(item.activeBootcampTitle),
    notesCount: asNum(item.notes_count) ?? asNum(item.notesCount) ?? 0,
    callsCount: asNum(item.calls_count) ?? asNum(item.callsCount) ?? 0,
    lastCallAt: asStr(item.last_call_at) ?? asStr(item.lastCallAt),
    lastActivityAt: asStr(item.last_activity_at) ?? asStr(item.lastActivityAt),
    followUpState: followUpState(user.followUpAt),
  };
}

export function normalizeEnrollment(item: unknown): Enrollment | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const userId = asNum(item.user_id) ?? asNum(item.userId);
  const bootcampId = asNum(item.bootcamp_id) ?? asNum(item.bootcampId);
  const status = asNum(item.status);
  if (id == null || userId == null || bootcampId == null || status == null) {
    return null;
  }

  const statusLabel =
    asStr(item.status_label) ??
    asStr(item.statusLabel) ??
    asStr(item.status_display) ??
    enrollmentStatusLabel(status as EnrollmentStatus);

  return {
    id,
    userId,
    bootcampId,
    status: status as EnrollmentStatus,
    statusLabel,
    nextStepBy: asNum(item.next_step_by) ?? asNum(item.nextStepBy) ?? 1,
    nextStepByDisplay:
      asStr(item.next_step_by_display) ??
      asStr(item.nextStepByDisplay) ??
      "",
    enrolledAt: asStr(item.enrolled_at) ?? asStr(item.enrolledAt) ?? "",
    notes: asStr(item.notes),
    paymentId: asNum(item.payment_id) ?? asNum(item.paymentId),
  };
}

function normalizeNote(item: unknown, fallbackUserId?: number): CustomerNote | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const userId =
    asNum(item.user_id) ?? asNum(item.userId) ?? fallbackUserId ?? null;
  if (id == null || userId == null) return null;
  return {
    id,
    userId,
    body: asStr(item.body) ?? "",
    authorName: asStr(item.author_name) ?? asStr(item.authorName) ?? "—",
    createdAt: asStr(item.created_at) ?? asStr(item.createdAt) ?? "",
  };
}

export function normalizeCall(item: unknown, fallbackUserId?: number): CustomerCall | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const userId =
    asNum(item.user_id) ?? asNum(item.userId) ?? fallbackUserId ?? null;
  if (id == null || userId == null) return null;

  const outcomeRaw =
    (asStr(item.outcome) ?? CALL_OUTCOME.ANSWERED).toLowerCase();
  const outcome = (
    Object.values(CALL_OUTCOME) as string[]
  ).includes(outcomeRaw)
    ? (outcomeRaw as CallOutcome)
    : CALL_OUTCOME.ANSWERED;

  return {
    id,
    userId,
    enrollmentId: asNum(item.enrollment_id) ?? asNum(item.enrollmentId),
    calledAt:
      asStr(item.called_at) ??
      asStr(item.calledAt) ??
      asStr(item.created_at) ??
      asStr(item.createdAt) ??
      "",
    durationMinutes:
      asNum(item.duration_minutes) ?? asNum(item.durationMinutes),
    outcome,
    outcomeLabel: callOutcomeLabel(
      outcome,
      asStr(item.outcome_label) ?? asStr(item.outcomeLabel),
    ),
    summary: asStr(item.summary) ?? "",
    authorName: asStr(item.author_name) ?? asStr(item.authorName) ?? "—",
  };
}

function normalizeActivity(item: unknown): CustomerActivity | null {
  if (!isObj(item)) return null;
  const id = asStr(item.id) ?? String(asNum(item.id) ?? "");
  if (!id) return null;
  const kindRaw = (asStr(item.kind) ?? "note").toLowerCase();
  const kind: CustomerActivityKind = (
    ["note", "call", "enrollment", "followup"] as CustomerActivityKind[]
  ).includes(kindRaw as CustomerActivityKind)
    ? (kindRaw as CustomerActivityKind)
    : "note";

  return {
    id,
    kind,
    title: asStr(item.title) ?? "",
    body: asStr(item.body) ?? "",
    at: asStr(item.at) ?? "",
    meta: asStr(item.meta) ?? undefined,
  };
}

function toProfileWrite(profile: Partial<UserProfile>) {
  const body: Record<string, unknown> = {};
  if (profile.birthDate !== undefined) body.birth_date = profile.birthDate;
  if (profile.nationalId !== undefined) body.national_id = profile.nationalId;
  if (profile.englishFirstName !== undefined) {
    body.english_first_name = profile.englishFirstName;
  }
  if (profile.englishLastName !== undefined) {
    body.english_last_name = profile.englishLastName;
  }
  if (profile.email !== undefined) body.email = profile.email;
  if (profile.address !== undefined) body.address = profile.address;
  if (profile.linkedinUrl !== undefined) body.linkedin_url = profile.linkedinUrl;
  if (profile.educationLevel !== undefined) {
    body.education_level = profile.educationLevel;
  }
  if (profile.fieldOfStudy !== undefined) {
    body.field_of_study = profile.fieldOfStudy;
  }
  if (profile.hasPriorExperience !== undefined) {
    body.has_prior_experience = profile.hasPriorExperience;
  }
  if (profile.experienceDescription !== undefined) {
    body.experience_description = profile.experienceDescription;
  }
  return body;
}

function toUserWriteBody(input: UserUpdateInput) {
  const body: Record<string, unknown> = {};
  if (input.isActive !== undefined) body.is_active = input.isActive;
  if (input.firstName !== undefined) body.first_name = input.firstName;
  if (input.lastName !== undefined) body.last_name = input.lastName;
  if (input.email !== undefined) body.email = input.email;
  if (input.phoneNumber !== undefined) body.phone_number = input.phoneNumber;
  if (input.gender !== undefined) body.gender = input.gender;
  if (input.profile !== undefined) body.profile = toProfileWrite(input.profile);
  return body;
}

function assertUser(payload: unknown): AdminUser {
  const user = normalizeUser(unwrapData(payload));
  if (!user) throw new Error("پاسخ کاربر معتبر نیست");
  return user;
}

function assertNote(payload: unknown, userId: number): CustomerNote {
  const note = normalizeNote(unwrapData(payload), userId);
  if (!note) throw new Error("پاسخ یادداشت معتبر نیست");
  return note;
}

function assertCall(payload: unknown, userId: number): CustomerCall {
  const call = normalizeCall(unwrapData(payload), userId);
  if (!call) throw new Error("پاسخ تماس معتبر نیست");
  return call;
}

function matchesCrmFilter(
  item: CustomerListItem,
  crmFilter: ListParams["crmFilter"],
) {
  switch (crmFilter) {
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
}

export const customersApi = {
  async list(params?: ListParams): Promise<CustomerListItem[]> {
    const payload = await apiRequest<unknown>("/panel/admin/customers/");
    let items = unwrapList(payload, ["customers"])
      .map(normalizeCustomerListItem)
      .filter((item): item is CustomerListItem => item != null);

    const search = params?.search?.trim().toLowerCase();
    if (search) {
      items = items.filter((item) =>
        `${item.firstName} ${item.lastName} ${item.phoneNumber} ${item.email} ${item.activeBootcampTitle ?? ""}`
          .toLowerCase()
          .includes(search),
      );
    }

    if (params?.status !== undefined && params.status !== "") {
      const status = Number(params.status);
      items = items.filter((item) => item.activeEnrollmentStatus === status);
    }

    if (params?.crmFilter && params.crmFilter !== "all") {
      items = items.filter((item) => matchesCrmFilter(item, params.crmFilter));
    }

    return items;
  },

  async get(id: number): Promise<CustomerDetail> {
    const payload = await apiRequest<unknown>(`/panel/admin/customers/${id}/`);
    const root = unwrapData(payload);
    if (!isObj(root)) throw new Error("پاسخ مشتری معتبر نیست");

    const userRaw = root.user ?? root;
    const user = normalizeUser(userRaw);
    if (!user || user.isStaff) throw new Error("مشتری پیدا نشد.");

    const enrollments = unwrapList(root.enrollments ?? root, ["enrollments"])
      .map(normalizeEnrollment)
      .filter((item): item is Enrollment => item != null)
      .sort((a, b) => +new Date(b.enrolledAt) - +new Date(a.enrolledAt));

    const notes = unwrapList(root.notes ?? [], ["notes"])
      .map((item) => normalizeNote(item, id))
      .filter((item): item is CustomerNote => item != null)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    const calls = unwrapList(root.calls ?? [], ["calls"])
      .map((item) => normalizeCall(item, id))
      .filter((item): item is CustomerCall => item != null)
      .sort((a, b) => +new Date(b.calledAt) - +new Date(a.calledAt));

    const activity = unwrapList(root.activity ?? [], ["activity"])
      .map(normalizeActivity)
      .filter((item): item is CustomerActivity => item != null)
      .sort((a, b) => +new Date(b.at) - +new Date(a.at));

    return { user, enrollments, notes, calls, activity };
  },

  async update(id: number, patch: UserUpdateInput): Promise<AdminUser> {
    const payload = await apiRequest<unknown>(`/panel/admin/customers/${id}/`, {
      method: "PATCH",
      body: toUserWriteBody(patch),
    });
    return assertUser(payload);
  },

  async addNote(userId: number, body: string): Promise<CustomerNote> {
    if (!body.trim()) throw new Error("متن یادداشت خالی است.");
    const payload = await apiRequest<unknown>(
      `/panel/admin/customers/${userId}/notes/`,
      {
        method: "POST",
        body: { body: body.trim() },
      },
    );
    return assertNote(payload, userId);
  },

  async deleteNote(userId: number, noteId: number): Promise<void> {
    await apiRequest<unknown>(
      `/panel/admin/customers/${userId}/notes/${noteId}/`,
      { method: "DELETE" },
    );
  },

  async addCall(input: {
    userId: number;
    enrollmentId?: number | null;
    calledAt?: string;
    durationMinutes?: number | null;
    outcome: CallOutcome;
    summary: string;
  }): Promise<CustomerCall> {
    if (!input.summary.trim()) throw new Error("خلاصه تماس خالی است.");
    const body: Record<string, unknown> = {
      outcome: input.outcome,
      summary: input.summary.trim(),
    };
    if (input.enrollmentId != null) body.enrollment_id = input.enrollmentId;
    if (input.durationMinutes != null) {
      body.duration_minutes = input.durationMinutes;
    }

    const payload = await apiRequest<unknown>(
      `/panel/admin/customers/${input.userId}/calls/`,
      { method: "POST", body },
    );
    return assertCall(payload, input.userId);
  },

  async toggleStar(userId: number): Promise<{ isStarred: boolean }> {
    const payload = await apiRequest<unknown>(
      `/panel/admin/customers/${userId}/star/`,
      { method: "POST" },
    );
    const root = unwrapData(payload);
    if (!isObj(root)) throw new Error("پاسخ ستاره معتبر نیست");
    return { isStarred: asBool(root.is_starred ?? root.isStarred) };
  },

  async setFollowUp(
    _userId: number,
    _followUpAt: string | null,
  ): Promise<AdminUser> {
    throw new Error("تنظیم پیگیری مشتری هنوز در API پشتیبانی نمی‌شود.");
  },

  async setTags(_userId: number, _crmTags: string[]): Promise<AdminUser> {
    throw new Error("برچسب‌های CRM هنوز در API پشتیبانی نمی‌شوند.");
  },
};
