import { apiRequest } from "@/lib/api/http";
import {
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import { normalizeMediaUrl } from "@/lib/mediaUrl";
import type { Sponsor, SponsorInput } from "@/lib/api/types";

function normalizeSponsor(item: unknown): Sponsor | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const name = asStr(item.name);
  if (id == null || !name) return null;

  const logoRaw = asStr(item.logo);

  return {
    id,
    name,
    website: asStr(item.website) ?? "",
    logo: logoRaw ? normalizeMediaUrl(logoRaw) : "",
  };
}

function toWriteBody(input: SponsorInput) {
  return {
    name: input.name,
    website: input.website,
    logo: input.logo,
  };
}

function assertSponsor(payload: unknown): Sponsor {
  const sponsor = normalizeSponsor(unwrapData(payload));
  if (!sponsor) throw new Error("پاسخ اسپانسر معتبر نیست");
  return sponsor;
}

export const sponsorsApi = {
  async list(): Promise<Sponsor[]> {
    const payload = await apiRequest<unknown>("/panel/admin/sponsors/");
    return unwrapList(payload, ["sponsors"])
      .map(normalizeSponsor)
      .filter((item): item is Sponsor => item != null);
  },

  async get(id: number): Promise<Sponsor> {
    const payload = await apiRequest<unknown>(`/panel/admin/sponsors/${id}/`);
    return assertSponsor(payload);
  },

  async create(input: SponsorInput): Promise<Sponsor> {
    const payload = await apiRequest<unknown>("/panel/admin/sponsors/", {
      method: "POST",
      body: toWriteBody(input),
    });
    return assertSponsor(payload);
  },

  async update(id: number, input: SponsorInput): Promise<Sponsor> {
    const payload = await apiRequest<unknown>(`/panel/admin/sponsors/${id}/`, {
      method: "PATCH",
      body: toWriteBody(input),
    });
    return assertSponsor(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/sponsors/${id}/`, {
      method: "DELETE",
    });
  },
};
