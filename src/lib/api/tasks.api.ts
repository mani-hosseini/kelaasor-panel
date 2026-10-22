import { apiRequest } from "@/lib/api/http";
import { asBool, asNum, asStr, isObj, unwrapData, unwrapList } from "@/lib/api/normalize";
import type { DashboardTaskItem } from "@/lib/api/types";

export type AdminTask = DashboardTaskItem & {
  numericId: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminTaskInput = {
  title: string;
  meta?: string;
  href?: string;
  done?: boolean;
};

function normalizeTask(item: unknown): AdminTask | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const title = asStr(item.title);
  if (id == null || !title) return null;
  return {
    numericId: id,
    id: String(id),
    title,
    meta: asStr(item.meta) ?? "",
    href: asStr(item.href) ?? "/",
    done: asBool(item.done),
    createdAt: asStr(item.created_at) ?? asStr(item.createdAt) ?? "",
    updatedAt: asStr(item.updated_at) ?? asStr(item.updatedAt) ?? "",
  };
}

function assertTask(payload: unknown): AdminTask {
  const task = normalizeTask(unwrapData(payload));
  if (!task) throw new Error("پاسخ تسک معتبر نیست");
  return task;
}

export const tasksApi = {
  async list(): Promise<AdminTask[]> {
    const payload = await apiRequest<unknown>("/panel/admin/tasks/");
    return unwrapList(payload, ["tasks"])
      .map(normalizeTask)
      .filter((item): item is AdminTask => item != null);
  },

  async get(id: number): Promise<AdminTask> {
    const payload = await apiRequest<unknown>(`/panel/admin/tasks/${id}/`);
    return assertTask(payload);
  },

  async create(input: AdminTaskInput): Promise<AdminTask> {
    const payload = await apiRequest<unknown>("/panel/admin/tasks/", {
      method: "POST",
      body: {
        title: input.title,
        meta: input.meta ?? "",
        href: input.href ?? "",
        done: input.done ?? false,
      },
    });
    return assertTask(payload);
  },

  async update(id: number, input: Partial<AdminTaskInput>): Promise<AdminTask> {
    const payload = await apiRequest<unknown>(`/panel/admin/tasks/${id}/`, {
      method: "PATCH",
      body: {
        title: input.title,
        meta: input.meta,
        href: input.href,
        done: input.done,
      },
    });
    return assertTask(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/tasks/${id}/`, { method: "DELETE" });
  },
};
