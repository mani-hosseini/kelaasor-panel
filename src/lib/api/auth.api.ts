import { clearAccessToken, setAccessToken } from "@/lib/auth";
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

function readAccessToken(payload: unknown) {
  const data = unwrapData(payload);
  if (!isObj(data)) return null;
  const direct = asStr(data.access_token) ?? asStr(data.accessToken);
  if (direct) return direct;
  return isObj(data.tokens) ? asStr(data.tokens.access) : null;
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
    const accessToken = readAccessToken(payload);
    if (accessToken) setAccessToken(accessToken);
    return assertSession(payload);
  },

  async me(): Promise<SessionUser> {
    const payload = await apiRequest<unknown>("/panel/admin/auth/me/");
    return assertSession(payload);
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<unknown>("/panel/admin/auth/logout/", { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },
};
