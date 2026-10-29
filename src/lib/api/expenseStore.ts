import { seedExpenses } from "@/lib/api/mock/expenses";
import type { Expense } from "@/lib/api/types";

const STORAGE_KEY = "kelaasor_finance_expenses_v1";

function cloneSeed(): Expense[] {
  return structuredClone(seedExpenses);
}

function readAll(): Expense[] {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeAll(cloneSeed());
      return cloneSeed();
    }
    const parsed = JSON.parse(raw) as Expense[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      writeAll(cloneSeed());
      return cloneSeed();
    }
    return parsed;
  } catch {
    return cloneSeed();
  }
}

function writeAll(items: Expense[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listExpenses(): Expense[] {
  return readAll().sort((a, b) => b.spentAt.localeCompare(a.spentAt));
}

export function resetExpensesToSeed(): Expense[] {
  const next = cloneSeed();
  writeAll(next);
  return next;
}
