import { apiRequest } from "@/lib/api/http";
import { asNum, asStr, isObj, unwrapData, unwrapList } from "@/lib/api/normalize";

export type StaticPageKey = "about" | "contact" | (string & {});

export type StaticPage = {
  id: number;
  key: string;
  title: string;
  content: string;
  data: Record<string, unknown>;
  updatedAt: string;
};

function normalizePage(item: unknown): StaticPage | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const key = asStr(item.key);
  if (id == null || !key) return null;
  const rawData = item.data;
  return {
    id,
    key,
    title: asStr(item.title) ?? "",
    content: asStr(item.content) ?? "",
    data: isObj(rawData) ? (rawData as Record<string, unknown>) : {},
    updatedAt: asStr(item.updated_at) ?? asStr(item.updatedAt) ?? "",
  };
}

function assertPage(payload: unknown): StaticPage {
  const page = normalizePage(unwrapData(payload));
  if (!page) throw new Error("پاسخ صفحه معتبر نیست");
  return page;
}

export const pagesApi = {
  async list(): Promise<StaticPage[]> {
    const payload = await apiRequest<unknown>("/panel/admin/pages/");
    return unwrapList(payload, ["pages"])
      .map(normalizePage)
      .filter((item): item is StaticPage => item != null);
  },

  async get(key: StaticPageKey): Promise<StaticPage> {
    const payload = await apiRequest<unknown>(`/panel/admin/pages/${key}/`);
    return assertPage(payload);
  },

  async update(
    key: StaticPageKey,
    input: { title?: string; content?: string; data?: Record<string, unknown> },
  ): Promise<StaticPage> {
    const payload = await apiRequest<unknown>(`/panel/admin/pages/${key}/`, {
      method: "PATCH",
      body: {
        title: input.title,
        content: input.content,
        data: input.data,
      },
    });
    return assertPage(payload);
  },
};
