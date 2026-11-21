import { routes } from "@/lib/routes";

export const SESSION_COOKIE = "kelaasor_admin_session";

const SESSION_VALUE = "kelaasor-staff";
const ACCESS_TOKEN_KEY = "kelaasor_admin_access";

export function getSessionCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE}=`));
  return match?.split("=")[1] ?? null;
}

export function hasSession() {
  return getSessionCookie() === SESSION_VALUE;
}

/** Local UI gate for Next middleware; API auth uses the `accessToken` cookie. */
export function setSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=${SESSION_VALUE}; path=/; max-age=${60 * 60 * 24 * 14}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

/** Staff JWT from `/panel/admin/auth/login/`. Sent as Bearer because the API cookie is host-only. */
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function loginRedirect() {
  return routes.login;
}
