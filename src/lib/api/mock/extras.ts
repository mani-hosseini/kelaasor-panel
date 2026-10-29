import type { AdminTask, AdminTaskInput } from "@/lib/api/tasks.api";
import type { StaticPage } from "@/lib/api/pages.api";
import { defaultAboutContent, defaultContactContent } from "@/lib/site-content/seed";

type PageRecord = StaticPage;

const pages: Record<string, PageRecord> = {
  about: {
    id: 1,
    key: "about",
    title: "درباره ما",
    content: defaultAboutContent.hero.sharedText,
    data: defaultAboutContent as unknown as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  },
  contact: {
    id: 2,
    key: "contact",
    title: "تماس با ما",
    content: defaultContactContent.hero.description,
    data: defaultContactContent as unknown as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  },
};

let taskSeq = 3;
const tasks: AdminTask[] = [
  {
    numericId: 1,
    id: "1",
    title: "تماس با متقاضی بوت‌کمپ محصول",
    meta: "پیگیری امروز",
    href: "/customers/1",
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    numericId: 2,
    id: "2",
    title: "بررسی فیش پرداخت اقساطی",
    meta: "صف پرداخت",
    href: "/payments",
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockExtras = {
  listPages(): StaticPage[] {
    return Object.values(pages);
  },

  getPage(key: string): StaticPage {
    const existing = pages[key];
    if (existing) return existing;
    const created: PageRecord = {
      id: Object.keys(pages).length + 1,
      key,
      title: key,
      content: "",
      data: {},
      updatedAt: new Date().toISOString(),
    };
    pages[key] = created;
    return created;
  },

  updatePage(
    key: string,
    input: { title?: string; content?: string; data?: Record<string, unknown> },
  ): StaticPage {
    const page = this.getPage(key);
    pages[key] = {
      ...page,
      title: input.title ?? page.title,
      content: input.content ?? page.content,
      data: input.data ?? page.data,
      updatedAt: new Date().toISOString(),
    };
    return pages[key];
  },

  listTasks(): AdminTask[] {
    return [...tasks];
  },

  getTask(id: number): AdminTask {
    const task = tasks.find((item) => item.numericId === id);
    if (!task) throw new Error("تسک پیدا نشد.");
    return task;
  },

  createTask(input: AdminTaskInput): AdminTask {
    const id = taskSeq++;
    const task: AdminTask = {
      numericId: id,
      id: String(id),
      title: input.title,
      meta: input.meta ?? "",
      href: input.href ?? "/",
      done: input.done ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(task);
    return task;
  },

  updateTask(id: number, input: Partial<AdminTaskInput>): AdminTask {
    const index = tasks.findIndex((item) => item.numericId === id);
    if (index < 0) throw new Error("تسک پیدا نشد.");
    const current = tasks[index];
    const next: AdminTask = {
      ...current,
      title: input.title ?? current.title,
      meta: input.meta ?? current.meta,
      href: input.href ?? current.href,
      done: input.done ?? current.done,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = next;
    return next;
  },

  removeTask(id: number): void {
    const index = tasks.findIndex((item) => item.numericId === id);
    if (index < 0) throw new Error("تسک پیدا نشد.");
    tasks.splice(index, 1);
  },
};
