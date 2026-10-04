import { apiRequest } from "@/lib/api/http";
import {
  asBool,
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import { normalizeMediaUrl } from "@/lib/mediaUrl";
import {
  eventStatusLabels,
  type Bootcamp,
  type BootcampChapter,
  type BootcampEvent,
  type BootcampInput,
  type BootcampLesson,
  type BootcampMedia,
  type ListParams,
} from "@/lib/api/types";

function parseIdList(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "number") return entry;
        if (isObj(entry)) return asNum(entry.id);
        return asNum(entry);
      })
      .filter((id): id is number => id != null);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parseIdList(parsed);
    } catch {
      // comma-separated fallback
    }
    return value
      .split(",")
      .map((part) => asNum(part.trim()))
      .filter((id): id is number => id != null);
  }
  return [];
}

function normalizeLesson(item: unknown, index: number): BootcampLesson | null {
  if (!isObj(item)) return null;
  const title = asStr(item.title);
  if (!title) return null;
  return {
    id: asNum(item.id) ?? -(index + 1),
    title,
    ordering: asNum(item.ordering) ?? index + 1,
  };
}

function normalizeChapter(item: unknown, index: number): BootcampChapter | null {
  if (!isObj(item)) return null;
  const title = asStr(item.title);
  if (!title) return null;
  const lessons = (Array.isArray(item.lessons) ? item.lessons : [])
    .map((lesson, lessonIndex) => normalizeLesson(lesson, lessonIndex))
    .filter((lesson): lesson is BootcampLesson => lesson != null);

  return {
    id: asNum(item.id) ?? -(index + 1),
    title,
    ordering: asNum(item.ordering) ?? index + 1,
    lessons,
  };
}

function normalizeMedia(item: unknown, index: number): BootcampMedia | null {
  if (!isObj(item)) return null;
  const title = asStr(item.title);
  const fileRaw = asStr(item.file);
  if (!title || !fileRaw) return null;

  const mediaTypeRaw = (asStr(item.media_type) ?? asStr(item.mediaType) ?? "file").toLowerCase();
  const mediaType: BootcampMedia["mediaType"] =
    mediaTypeRaw === "video" || mediaTypeRaw === "image" || mediaTypeRaw === "file"
      ? mediaTypeRaw
      : "file";

  return {
    id: asNum(item.id) ?? -(index + 1),
    title,
    mediaType,
    file: normalizeMediaUrl(fileRaw),
  };
}

function normalizeEvent(item: unknown): BootcampEvent | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const status = asNum(item.status) ?? 0;
  const finalPrice = asNum(item.final_price) ?? asNum(item.finalPrice);
  if (id == null || finalPrice == null) return null;

  const statusDisplay =
    asStr(item.status_display) ??
    asStr(item.statusDisplay) ??
    eventStatusLabels[status] ??
    "نامشخص";

  return {
    id,
    status,
    statusDisplay,
    totalEnrollmentsCount:
      asNum(item.total_enrollments_count) ?? asNum(item.totalEnrollmentsCount) ?? 0,
    confirmedEnrollmentsCount:
      asNum(item.confirmed_enrollments_count) ??
      asNum(item.confirmedEnrollmentsCount) ??
      0,
    startDate: asStr(item.start_date) ?? asStr(item.startDate) ?? "",
    endDate: asStr(item.end_date) ?? asStr(item.endDate) ?? "",
    sessionsScheduleDays:
      asStr(item.sessions_schedule_days) ?? asStr(item.sessionsScheduleDays) ?? "",
    sessionsScheduleHours:
      asStr(item.sessions_schedule_hours) ?? asStr(item.sessionsScheduleHours) ?? "",
    primaryPrice: asNum(item.primary_price) ?? asNum(item.primaryPrice),
    finalPrice,
    capacity: asNum(item.capacity) ?? 0,
    registrationDeadline:
      asStr(item.registration_deadline) ??
      asStr(item.registrationDeadline) ??
      asStr(item.start_date) ??
      "",
  };
}

function normalizeBootcamp(item: unknown): Bootcamp | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const title = asStr(item.title);
  if (id == null || !title) return null;

  const topicId =
    asNum(item.topic_id) ??
    asNum(item.topicId) ??
    (isObj(item.topic) ? asNum(item.topic.id) : null) ??
    0;

  const bannerRaw = asStr(item.banner);
  const chapters = (Array.isArray(item.chapters) ? item.chapters : [])
    .map((chapter, index) => normalizeChapter(chapter, index))
    .filter((chapter): chapter is BootcampChapter => chapter != null);
  const medias = (Array.isArray(item.medias) ? item.medias : [])
    .map((media, index) => normalizeMedia(media, index))
    .filter((media): media is BootcampMedia => media != null);

  let currentEvent: BootcampEvent | null = null;
  if (isObj(item.current_event) || isObj(item.currentEvent)) {
    currentEvent = normalizeEvent(item.current_event ?? item.currentEvent);
  }

  const installmentRaw =
    asNum(item.installment_count) ?? asNum(item.installmentCount);

  return {
    id,
    title,
    slug: asStr(item.slug) ?? "",
    brief: asStr(item.brief) ?? "",
    description: asStr(item.description) ?? "",
    banner: bannerRaw ? normalizeMediaUrl(bannerRaw) : null,
    durationInWeeks: asNum(item.duration_in_weeks) ?? asNum(item.durationInWeeks) ?? 0,
    capacity: asNum(item.capacity) ?? currentEvent?.capacity ?? 0,
    ordering: asNum(item.ordering) ?? 0,
    hasBnpl: asBool(item.has_bnpl ?? item.hasBnpl),
    installmentCount: installmentRaw ?? 1,
    topicId,
    instructorIds: parseIdList(item.instructor_ids ?? item.instructorIds),
    sponsorIds: parseIdList(item.sponsor_ids ?? item.sponsorIds),
    chapters,
    medias,
    currentEvent,
  };
}

function assertBootcamp(payload: unknown): Bootcamp {
  const bootcamp = normalizeBootcamp(unwrapData(payload));
  if (!bootcamp) throw new Error("پاسخ بوت‌کمپ معتبر نیست");
  return bootcamp;
}

function toWriteBody(input: Partial<BootcampInput>) {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.slug !== undefined) body.slug = input.slug;
  if (input.brief !== undefined) body.brief = input.brief;
  if (input.description !== undefined) body.description = input.description;
  if (input.durationInWeeks !== undefined) body.duration_in_weeks = input.durationInWeeks;
  if (input.capacity !== undefined) body.capacity = input.capacity;
  if (input.topicId !== undefined) body.topic_id = input.topicId;
  if (input.hasBnpl !== undefined) body.has_bnpl = input.hasBnpl;
  if (input.installmentCount !== undefined) body.installment_count = input.installmentCount;
  if (input.banner !== undefined) body.banner = input.banner ?? "";
  if (input.instructorIds !== undefined) body.instructor_ids = input.instructorIds;
  if (input.sponsorIds !== undefined) body.sponsor_ids = input.sponsorIds;
  if (input.primaryPrice !== undefined) body.primary_price = input.primaryPrice;
  if (input.finalPrice !== undefined) body.final_price = input.finalPrice;
  if (input.startDate !== undefined) body.start_date = input.startDate;
  if (input.endDate !== undefined) body.end_date = input.endDate;
  if (input.registrationDeadline !== undefined) {
    body.registration_deadline = input.registrationDeadline;
  }
  if (input.eventStatus !== undefined) body.event_status = input.eventStatus;
  if (input.sessionsScheduleDays !== undefined) {
    body.sessions_schedule_days = input.sessionsScheduleDays;
  }
  if (input.sessionsScheduleHours !== undefined) {
    body.sessions_schedule_hours = input.sessionsScheduleHours;
  }
  return body;
}

function toChaptersWrite(chapters: BootcampChapter[]) {
  return chapters.map((chapter, index) => ({
    ...(chapter.id > 0 ? { id: chapter.id } : {}),
    title: chapter.title,
    ordering: index + 1,
    lessons: chapter.lessons.map((lesson, lessonIndex) => ({
      ...(lesson.id > 0 ? { id: lesson.id } : {}),
      title: lesson.title,
      ordering: lessonIndex + 1,
    })),
  }));
}

function toMediasWrite(medias: BootcampMedia[]) {
  return medias.map((media) => ({
    ...(media.id > 0 ? { id: media.id } : {}),
    title: media.title,
    media_type: media.mediaType,
    file: media.file,
  }));
}

export const bootcampsApi = {
  async list(params?: ListParams): Promise<Bootcamp[]> {
    const payload = await apiRequest<unknown>("/panel/admin/bootcamps/");
    let items = unwrapList(payload, ["bootcamps"])
      .map(normalizeBootcamp)
      .filter((item): item is Bootcamp => item != null);

    const search = params?.search?.trim().toLowerCase();
    if (search) {
      items = items.filter((item) =>
        `${item.title} ${item.brief} ${item.slug}`.toLowerCase().includes(search),
      );
    }
    return items;
  },

  async get(id: number): Promise<Bootcamp> {
    const payload = await apiRequest<unknown>(`/panel/admin/bootcamps/${id}/`);
    return assertBootcamp(payload);
  },

  async create(input: BootcampInput): Promise<Bootcamp> {
    const payload = await apiRequest<unknown>("/panel/admin/bootcamps/", {
      method: "POST",
      body: toWriteBody(input),
    });
    return assertBootcamp(payload);
  },

  async update(
    id: number,
    input: Partial<BootcampInput> & Partial<Bootcamp>,
  ): Promise<Bootcamp> {
    const payload = await apiRequest<unknown>(`/panel/admin/bootcamps/${id}/`, {
      method: "PATCH",
      body: toWriteBody(input),
    });
    return assertBootcamp(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/bootcamps/${id}/`, {
      method: "DELETE",
    });
  },

  async setChapters(id: number, chapters: BootcampChapter[]): Promise<Bootcamp> {
    await apiRequest<unknown>(`/panel/admin/bootcamps/${id}/chapters/`, {
      method: "PUT",
      body: toChaptersWrite(chapters),
    });
    return this.get(id);
  },

  async setMedias(id: number, medias: BootcampMedia[]): Promise<Bootcamp> {
    await apiRequest<unknown>(`/panel/admin/bootcamps/${id}/medias/`, {
      method: "PUT",
      body: toMediasWrite(medias),
    });
    return this.get(id);
  },
};
