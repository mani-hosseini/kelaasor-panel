/**
 * Defensive helpers for backend payloads that may wrap lists/objects
 * in several shapes (`data`, `results`, nested keys, snake_case fields).
 * Module APIs should prefer backend `*_display` labels when present.
 */

export function isObj(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function asNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

export function asStr(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

/** Prefer `data` wrapper when the API returns `{ data: T }`. */
export function unwrapData(payload: unknown): unknown {
  if (isObj(payload) && "data" in payload && payload.data != null) {
    return payload.data;
  }
  return payload;
}

const DEFAULT_LIST_KEYS = [
  "results",
  "data",
  "items",
  "enrollments",
  "payments",
  "certificates",
  "users",
  "customers",
  "bootcamps",
  "instructors",
  "posts",
  "topics",
  "sponsors",
  "partners",
] as const;

export function unwrapList(
  payload: unknown,
  extraKeys: readonly string[] = [],
): unknown[] {
  const root = unwrapData(payload);
  if (Array.isArray(root)) return root;
  if (!isObj(root)) return [];

  const keys = [...extraKeys, ...DEFAULT_LIST_KEYS];
  for (const key of keys) {
    const value = root[key];
    if (Array.isArray(value)) return value;
    if (!isObj(value)) continue;
    for (const nested of keys) {
      if (Array.isArray(value[nested])) return value[nested] as unknown[];
    }
  }
  return [];
}

export type Paginated<T> = {
  items: T[];
  count: number | null;
  next: string | null;
  previous: string | null;
};

/** DRF-style `{ count, next, previous, results }` or plain arrays. */
export function unwrapPaginated(
  payload: unknown,
  extraKeys: readonly string[] = [],
): Paginated<unknown> {
  const root = unwrapData(payload);
  const items = unwrapList(payload, extraKeys);

  if (!isObj(root)) {
    return { items, count: items.length, next: null, previous: null };
  }

  return {
    items,
    count: asNum(root.count) ?? items.length,
    next: asStr(root.next),
    previous: asStr(root.previous),
  };
}

export function pickDisplay(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const value of candidates) {
    if (value?.trim()) return value.trim();
  }
  return null;
}
