import { apiRequest } from "@/lib/api/http";
import {
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import { normalizeMediaUrl } from "@/lib/mediaUrl";
import type { Instructor, InstructorInput, ListParams } from "@/lib/api/types";

function normalizeInstructor(item: unknown): Instructor | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const fullName = asStr(item.full_name) ?? asStr(item.fullName);
  if (id == null || !fullName) return null;

  const avatarRaw = asStr(item.avatar);
  const companyLogoRaw =
    asStr(item.company_logo) ?? asStr(item.companyLogo);

  return {
    id,
    fullName,
    avatar: avatarRaw ? normalizeMediaUrl(avatarRaw) : null,
    jobTitle: asStr(item.job_title) ?? asStr(item.jobTitle) ?? "",
    linkedinUrl: asStr(item.linkedin_url) ?? asStr(item.linkedinUrl) ?? "",
    company: asStr(item.company),
    companyLogo: companyLogoRaw ? normalizeMediaUrl(companyLogoRaw) : null,
    bio: asStr(item.bio) ?? "",
  };
}

function toWriteBody(input: InstructorInput) {
  const body: Record<string, unknown> = {
    full_name: input.fullName,
    job_title: input.jobTitle,
    linkedin_url: input.linkedinUrl,
    company: input.company,
    bio: input.bio,
    avatar: input.avatar,
    company_logo: input.companyLogo,
  };
  if (input.phoneNumber !== undefined) {
    body.phone_number = input.phoneNumber;
  }
  return body;
}

function assertInstructor(payload: unknown): Instructor {
  const instructor = normalizeInstructor(unwrapData(payload));
  if (!instructor) throw new Error("پاسخ مدرس معتبر نیست");
  return instructor;
}

export const instructorsApi = {
  async list(params?: ListParams): Promise<Instructor[]> {
    const payload = await apiRequest<unknown>("/panel/admin/instructors/");
    let items = unwrapList(payload, ["instructors"])
      .map(normalizeInstructor)
      .filter((item): item is Instructor => item != null);

    const search = params?.search?.trim().toLowerCase();
    if (search) {
      items = items.filter((item) =>
        `${item.fullName} ${item.jobTitle} ${item.company ?? ""} ${item.bio}`
          .toLowerCase()
          .includes(search),
      );
    }
    return items;
  },

  async get(id: number): Promise<Instructor> {
    const payload = await apiRequest<unknown>(`/panel/admin/instructors/${id}/`);
    return assertInstructor(payload);
  },

  async create(input: InstructorInput): Promise<Instructor> {
    const payload = await apiRequest<unknown>("/panel/admin/instructors/", {
      method: "POST",
      body: toWriteBody(input),
    });
    return assertInstructor(payload);
  },

  async update(id: number, input: InstructorInput): Promise<Instructor> {
    const payload = await apiRequest<unknown>(`/panel/admin/instructors/${id}/`, {
      method: "PATCH",
      body: toWriteBody(input),
    });
    return assertInstructor(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/instructors/${id}/`, {
      method: "DELETE",
    });
  },
};
