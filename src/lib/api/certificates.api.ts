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
import type { Certificate, ListParams } from "@/lib/api/types";

function normalizeCertificate(item: unknown): Certificate | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const userId = asNum(item.user_id) ?? asNum(item.userId);
  const enrollmentId = asNum(item.enrollment_id) ?? asNum(item.enrollmentId);
  const bootcampId = asNum(item.bootcamp_id) ?? asNum(item.bootcampId);
  const title = asStr(item.title);
  if (id == null || userId == null || enrollmentId == null || bootcampId == null || !title) {
    return null;
  }

  const rawBanner = asStr(item.banner);

  return {
    id,
    userId,
    enrollmentId,
    bootcampId,
    title,
    banner: rawBanner ? normalizeMediaUrl(rawBanner) : null,
    issuedAt: asStr(item.issued_at) ?? asStr(item.issuedAt) ?? "",
    revoked: asBool(item.revoked),
  };
}

function assertCertificate(payload: unknown): Certificate {
  const cert = normalizeCertificate(unwrapData(payload));
  if (!cert) throw new Error("پاسخ گواهی معتبر نیست");
  return cert;
}

export const certificatesApi = {
  async list(params?: ListParams): Promise<Certificate[]> {
    const payload = await apiRequest<unknown>("/panel/admin/certificates/");
    let items = unwrapList(payload, ["certificates"])
      .map(normalizeCertificate)
      .filter((item): item is Certificate => item != null);

    const search = params?.search?.trim().toLowerCase();
    if (search) {
      items = items.filter((item) =>
        `${item.title} ${item.id} ${item.userId} ${item.bootcampId}`
          .toLowerCase()
          .includes(search),
      );
    }
    return items;
  },

  async get(id: number): Promise<Certificate> {
    const payload = await apiRequest<unknown>(`/panel/admin/certificates/${id}/`);
    return assertCertificate(payload);
  },

  async issue(enrollmentId: number): Promise<Certificate> {
    const payload = await apiRequest<unknown>("/panel/admin/certificates/issue/", {
      method: "POST",
      body: { enrollment_id: enrollmentId },
    });
    return assertCertificate(payload);
  },

  /** Backend has no revoke endpoint yet. */
  async revoke(_id: number): Promise<Certificate> {
    throw new Error("باطل‌سازی گواهی هنوز در API پشتیبانی نمی‌شود.");
  },
};
