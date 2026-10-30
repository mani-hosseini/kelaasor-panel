import { apiRequest } from "@/lib/api/http";
import {
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import type { Expense, ExpenseCategory, ExpenseInput } from "@/lib/api/types";
import { EXPENSE_CATEGORY } from "@/lib/api/types";

const CATEGORIES = new Set<string>(Object.values(EXPENSE_CATEGORY));

function normalizeCategory(value: string | null | undefined): ExpenseCategory {
  if (value && CATEGORIES.has(value)) return value as ExpenseCategory;
  return EXPENSE_CATEGORY.OPERATIONS;
}

function normalizeDelivery(value: string | null | undefined): Expense["delivery"] {
  if (value === "online" || value === "in_person" || value === "shared") return value;
  return "shared";
}

export function normalizeExpense(item: unknown): Expense | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const title = asStr(item.title);
  const amount = asNum(item.amount);
  if (id == null || !title || amount == null) return null;

  return {
    id,
    title,
    category: normalizeCategory(asStr(item.category)),
    amount,
    season: asStr(item.season),
    bootcampId: asNum(item.bootcamp_id) ?? asNum(item.bootcampId),
    delivery: normalizeDelivery(asStr(item.delivery)),
    spentAt: asStr(item.spent_at) ?? asStr(item.spentAt) ?? "",
    note: asStr(item.note) ?? "",
  };
}

function assertExpense(payload: unknown): Expense {
  const expense = normalizeExpense(unwrapData(payload));
  if (!expense) throw new Error("پاسخ هزینه معتبر نیست");
  return expense;
}

function toWriteBody(input: ExpenseInput) {
  return {
    title: input.title,
    category: input.category,
    amount: input.amount,
    season: input.season ?? null,
    bootcamp_id: input.bootcampId ?? null,
    delivery: input.delivery ?? "shared",
    spent_at: input.spentAt,
    note: input.note ?? "",
  };
}

export const expensesApi = {
  async list(): Promise<Expense[]> {
    const payload = await apiRequest<unknown>("/panel/admin/expenses/");
    return unwrapList(payload, ["expenses"])
      .map(normalizeExpense)
      .filter((item): item is Expense => item != null)
      .sort((a, b) => b.spentAt.localeCompare(a.spentAt));
  },

  async get(id: number): Promise<Expense> {
    const payload = await apiRequest<unknown>(`/panel/admin/expenses/${id}/`);
    return assertExpense(payload);
  },

  async create(input: ExpenseInput): Promise<Expense> {
    const payload = await apiRequest<unknown>("/panel/admin/expenses/", {
      method: "POST",
      body: toWriteBody(input),
    });
    return assertExpense(payload);
  },

  async update(id: number, input: Partial<ExpenseInput>): Promise<Expense> {
    const body: Record<string, unknown> = {};
    if (input.title !== undefined) body.title = input.title;
    if (input.category !== undefined) body.category = input.category;
    if (input.amount !== undefined) body.amount = input.amount;
    if (input.season !== undefined) body.season = input.season;
    if (input.bootcampId !== undefined) body.bootcamp_id = input.bootcampId;
    if (input.delivery !== undefined) body.delivery = input.delivery;
    if (input.spentAt !== undefined) body.spent_at = input.spentAt;
    if (input.note !== undefined) body.note = input.note;

    const payload = await apiRequest<unknown>(`/panel/admin/expenses/${id}/`, {
      method: "PATCH",
      body,
    });
    return assertExpense(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/expenses/${id}/`, {
      method: "DELETE",
    });
  },
};
