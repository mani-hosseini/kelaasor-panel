import { apiRequest } from "@/lib/api/http";
import { asNum, asStr, isObj, unwrapData } from "@/lib/api/normalize";
import type { AppSettings } from "@/lib/api/types";

function normalizeSettings(item: unknown): AppSettings | null {
  if (!isObj(item)) return null;
  return {
    bankName: asStr(item.bank_name) ?? asStr(item.bankName) ?? "",
    bankOwnerName: asStr(item.bank_owner_name) ?? asStr(item.bankOwnerName) ?? "",
    bankCardNumber: asStr(item.bank_card_number) ?? asStr(item.bankCardNumber) ?? "",
    bankSheba: asStr(item.bank_sheba) ?? asStr(item.bankSheba) ?? "",
    lmsUrl: asStr(item.lms_url) ?? asStr(item.lmsUrl) ?? "",
    defaultInstallmentCount:
      asNum(item.default_installment_count) ??
      asNum(item.defaultInstallmentCount) ??
      3,
  };
}

function assertSettings(payload: unknown): AppSettings {
  const settings = normalizeSettings(unwrapData(payload));
  if (!settings) throw new Error("پاسخ تنظیمات معتبر نیست");
  return settings;
}

export const settingsApi = {
  async get(): Promise<AppSettings> {
    const payload = await apiRequest<unknown>("/panel/admin/settings/");
    return assertSettings(payload);
  },

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const payload = await apiRequest<unknown>("/panel/admin/settings/update/", {
      method: "PATCH",
      body: {
        bankName: patch.bankName,
        bankOwnerName: patch.bankOwnerName,
        bankCardNumber: patch.bankCardNumber,
        bankSheba: patch.bankSheba,
        lmsUrl: patch.lmsUrl,
        defaultInstallmentCount: patch.defaultInstallmentCount,
      },
    });
    return assertSettings(payload);
  },
};
