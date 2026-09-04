import { routes } from "@/lib/routes";

export const SESSION_COOKIE = "kelaasor_admin_session";
export const DEMO_EMAIL = "staff@kelaasor.com";
export const DEMO_PASSWORD = "KelaasorAdmin!2026";

const SESSION_VALUE = "kelaasor-staff";

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

export function setSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=${SESSION_VALUE}; path=/; max-age=${60 * 60 * 24 * 14}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export function loginRedirect() {
  return routes.login;
}
