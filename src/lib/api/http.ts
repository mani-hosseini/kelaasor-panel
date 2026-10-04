import BASE_URL from "@/lib/baseUrl";
import { ApiRequestError, extractApiErrorMessage } from "@/lib/api/error";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
  searchParams?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  /** When true, return the raw Response (for file downloads). */
  raw?: boolean;
};

function assertBaseUrl() {
  if (!BASE_URL) {
    throw new Error("آدرس API تنظیم نشده است (NEXT_PUBLIC_API_BASE_URL)");
  }
}

function buildUrl(path: string, searchParams?: RequestOptions["searchParams"]) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${BASE_URL}${normalized}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value == null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function readError(res: Response) {
  const data = await res.json().catch(() => null);
  return (
    extractApiErrorMessage(data) ??
    (res.status === 401
      ? "برای ادامه ابتدا وارد شوید"
      : res.status === 403
        ? "دسترسی مجاز نیست"
        : `خطا در ارتباط با سرور (${res.status})`)
  );
}

/**
 * Cookie-authenticated fetch against `NEXT_PUBLIC_API_BASE_URL`
 * (same origin env as kelaasor-camp). Prefer this from every live `*.api.ts`.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  assertBaseUrl();

  const headers: Record<string, string> = {
    "Accept-Language": "fa-IR",
    Accept: "application/json",
  };

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(buildUrl(path, options.searchParams), {
    method: options.method ?? (options.body || options.formData ? "POST" : "GET"),
    headers,
    body,
    credentials: "include",
    cache: "no-store",
    signal: options.signal,
  });

  if (!res.ok) {
    throw new ApiRequestError(await readError(res), res.status);
  }

  if (options.raw) {
    return res as T;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
