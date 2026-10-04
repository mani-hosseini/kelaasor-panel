import BASE_URL from "@/lib/baseUrl";

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i;

function getApiOrigin() {
  return (BASE_URL || "https://api.kelaasor.com").replace(/\/$/, "");
}

/** Resolve relative `/media/...` paths against the same API origin as camp. */
export function normalizeMediaUrl(url: string | null | undefined) {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/media/")) {
    return `${getApiOrigin()}${trimmed}`;
  }

  if (trimmed.startsWith("media/")) {
    return `${getApiOrigin()}/${trimmed}`;
  }

  if (!trimmed.startsWith("http")) {
    return trimmed;
  }

  if (LOCAL_ORIGIN.test(trimmed)) {
    return trimmed;
  }

  return trimmed.replace(/^http:\/\//i, "https://");
}
