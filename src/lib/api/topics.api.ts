import { apiRequest } from "@/lib/api/http";
import {
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import type { Topic, TopicInput } from "@/lib/api/types";

function normalizeTopic(item: unknown): Topic | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const title = asStr(item.title);
  if (id == null || !title) return null;
  return { id, title };
}

function assertTopic(payload: unknown): Topic {
  const topic = normalizeTopic(unwrapData(payload));
  if (!topic) throw new Error("پاسخ موضوع معتبر نیست");
  return topic;
}

export const topicsApi = {
  async list(): Promise<Topic[]> {
    const payload = await apiRequest<unknown>("/panel/admin/topics/");
    return unwrapList(payload, ["topics"])
      .map(normalizeTopic)
      .filter((item): item is Topic => item != null);
  },

  async get(id: number): Promise<Topic> {
    const payload = await apiRequest<unknown>(`/panel/admin/topics/${id}/`);
    return assertTopic(payload);
  },

  async create(input: TopicInput): Promise<Topic> {
    const payload = await apiRequest<unknown>("/panel/admin/topics/", {
      method: "POST",
      body: { title: input.title },
    });
    return assertTopic(payload);
  },

  async update(id: number, input: TopicInput): Promise<Topic> {
    const payload = await apiRequest<unknown>(`/panel/admin/topics/${id}/`, {
      method: "PATCH",
      body: { title: input.title },
    });
    return assertTopic(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/topics/${id}/`, {
      method: "DELETE",
    });
  },
};
