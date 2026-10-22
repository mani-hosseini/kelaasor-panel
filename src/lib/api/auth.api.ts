import { apiRequest } from "@/lib/api/http";
import { asNum, asStr, isObj, unwrapData } from "@/lib/api/normalize";
import type { LoginInput, SessionUser } from "@/lib/api/types";

function normalizeSession(item: unknown): SessionUser | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  if (id == null) return null;
  return {
    id,
    name: asStr(item.name) ?? "مدیر",
    email: asStr(item.email) ?? "",
    role: asStr(item.role) ?? "staff",
  };
}

function assertSession(payload: unknown): SessionUser {
  const session = normalizeSession(unwrapData(payload));
  if (!session) throw new Error("پاسخ ورود معتبر نیست");
  return session;
}

export const authApi = {
  async login(input: LoginInput): Promise<SessionUser> {
    const payload = await apiRequest<unknown>("/panel/admin/auth/login/", {
      method: "POST",
      body: {
        email: input.email.trim(),
        password: input.password,
      },
    });
    return assertSession(payload);
  },

  async me(): Promise<SessionUser> {
    const payload = await apiRequest<unknown>("/panel/admin/auth/me/");
    return assertSession(payload);
  },

  async logout(): Promise<void> {
    await apiRequest<unknown>("/panel/admin/auth/logout/", { method: "POST" });
  },
};
