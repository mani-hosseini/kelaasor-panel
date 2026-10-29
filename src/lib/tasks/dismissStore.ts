const STORAGE_KEY = "kelaasor_system_tasks_dismissed_v1";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function listDismissedSystemTasks(): string[] {
  return [...readSet()];
}

export function dismissSystemTask(id: string) {
  const set = readSet();
  set.add(id);
  writeSet(set);
}

export function undismissSystemTask(id: string) {
  const set = readSet();
  set.delete(id);
  writeSet(set);
}

export function clearDismissedSystemTasks() {
  writeSet(new Set());
}
