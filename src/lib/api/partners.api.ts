import { apiRequest } from "@/lib/api/http";
import {
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import { normalizeMediaUrl } from "@/lib/mediaUrl";
import type { PartnerCompany, PartnerCompanyInput } from "@/lib/api/types";

function normalizePartner(item: unknown): PartnerCompany | null {
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
    ordering: asNum(item.ordering) ?? undefined,
  };
}

function toWriteBody(input: PartnerCompanyInput) {
  return {
    name: input.name,
    website: input.website,
    logo: input.logo,
  };
}

function assertPartner(payload: unknown): PartnerCompany {
  const partner = normalizePartner(unwrapData(payload));
  if (!partner) throw new Error("پاسخ شریک معتبر نیست");
  return partner;
}

export const partnersApi = {
  async list(): Promise<PartnerCompany[]> {
    const payload = await apiRequest<unknown>("/panel/admin/partners/");
    return unwrapList(payload, ["partners"])
      .map(normalizePartner)
      .filter((item): item is PartnerCompany => item != null)
      .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
  },

  async get(id: number): Promise<PartnerCompany> {
    const payload = await apiRequest<unknown>(`/panel/admin/partners/${id}/`);
    return assertPartner(payload);
  },

  async create(input: PartnerCompanyInput): Promise<PartnerCompany> {
    const payload = await apiRequest<unknown>("/panel/admin/partners/", {
      method: "POST",
      body: toWriteBody(input),
    });
    return assertPartner(payload);
  },

  async update(id: number, input: PartnerCompanyInput): Promise<PartnerCompany> {
    const payload = await apiRequest<unknown>(`/panel/admin/partners/${id}/`, {
      method: "PATCH",
      body: toWriteBody(input),
    });
    return assertPartner(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/partners/${id}/`, {
      method: "DELETE",
    });
  },
};
