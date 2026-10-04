import { apiRequest } from "@/lib/api/http";
import {
  asBool,
  asNum,
  asStr,
  isObj,
  unwrapData,
  unwrapList,
} from "@/lib/api/normalize";
import { normalizeMediaUrl } from "@/lib/mediaUrl";
import type {
  BlogCategory,
  BlogComment,
  BlogPost,
  BlogPostInput,
  ListParams,
} from "@/lib/api/types";

function normalizeCategory(item: unknown): BlogCategory | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const title = asStr(item.title);
  if (id == null || !title) return null;
  return {
    id,
    title,
    slug: asStr(item.slug) ?? "",
  };
}

function normalizeComment(item: unknown, postId: number): BlogComment | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  if (id == null) return null;

  return {
    id,
    postId,
    name: asStr(item.name) ?? "کاربر",
    email: asStr(item.email) ?? "",
    text: asStr(item.text) ?? "",
    createdAt: asStr(item.created_at) ?? asStr(item.createdAt) ?? "",
    approved: asBool(item.approved),
  };
}

function normalizePost(item: unknown): BlogPost | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const title = asStr(item.title);
  if (id == null || !title) return null;

  const category = isObj(item.category) ? item.category : null;
  const categoryId =
    asNum(category?.id) ?? asNum(item.category_id) ?? asNum(item.categoryId) ?? 0;
  const categoryTitle =
    asStr(category?.title) ?? asStr(item.category_title) ?? "بدون دسته";
  const categorySlug = asStr(category?.slug);

  const rawBanner = asStr(item.banner);
  const commentsRaw = Array.isArray(item.comments) ? item.comments : [];
  const comments = commentsRaw
    .map((entry) => normalizeComment(entry, id))
    .filter((entry): entry is BlogComment => entry != null);

  return {
    id,
    title,
    slug: asStr(item.slug) ?? "",
    authorId: asNum(item.author_id) ?? asNum(item.authorId),
    authorName: asStr(item.author) ?? asStr(item.author_name) ?? "—",
    categoryId,
    categoryTitle,
    categorySlug,
    excerpt: asStr(item.excerpt) ?? "",
    content: asStr(item.content) ?? "",
    banner: rawBanner ? normalizeMediaUrl(rawBanner) : "",
    status: asNum(item.status) ?? 0,
    statusDisplay: asStr(item.status_display) ?? asStr(item.statusDisplay),
    publishedAt: asStr(item.published_at) ?? asStr(item.publishedAt),
    viewCount: asNum(item.view_count) ?? asNum(item.viewCount) ?? 0,
    commentsCount:
      asNum(item.comments_count) ?? asNum(item.commentsCount) ?? comments.length,
    createdAt: asStr(item.created_at) ?? asStr(item.createdAt) ?? "",
    updatedAt: asStr(item.updated_at) ?? asStr(item.updatedAt),
    comments,
  };
}

function toWriteBody(input: Partial<BlogPostInput>) {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.slug !== undefined) body.slug = input.slug;
  if (input.excerpt !== undefined) body.excerpt = input.excerpt;
  if (input.content !== undefined) body.content = input.content;
  if (input.categoryId !== undefined) body.category_id = input.categoryId;
  if (input.status !== undefined) body.status = input.status;
  if (input.banner !== undefined) body.banner = input.banner;
  return body;
}

function assertPost(payload: unknown): BlogPost {
  const post = normalizePost(unwrapData(payload));
  if (!post) throw new Error("پاسخ پست بلاگ معتبر نیست");
  return post;
}

export const blogApi = {
  async categories(): Promise<BlogCategory[]> {
    const payload = await apiRequest<unknown>("/panel/admin/blog/categories/");
    return unwrapList(payload, ["categories"])
      .map(normalizeCategory)
      .filter((item): item is BlogCategory => item != null);
  },

  async list(params?: ListParams): Promise<BlogPost[]> {
    const payload = await apiRequest<unknown>("/panel/admin/blog/posts/");
    let posts = unwrapList(payload, ["posts"])
      .map(normalizePost)
      .filter((item): item is BlogPost => item != null);

    const search = params?.search?.trim().toLowerCase();
    if (search) {
      posts = posts.filter((item) =>
        `${item.title} ${item.excerpt} ${item.categoryTitle}`
          .toLowerCase()
          .includes(search),
      );
    }
    return posts;
  },

  async get(id: number): Promise<BlogPost> {
    const payload = await apiRequest<unknown>(`/panel/admin/blog/posts/${id}/`);
    return assertPost(payload);
  },

  async create(input: BlogPostInput): Promise<BlogPost> {
    const payload = await apiRequest<unknown>("/panel/admin/blog/posts/", {
      method: "POST",
      body: toWriteBody(input),
    });
    return assertPost(payload);
  },

  async update(id: number, input: Partial<BlogPostInput>): Promise<BlogPost> {
    const payload = await apiRequest<unknown>(`/panel/admin/blog/posts/${id}/`, {
      method: "PATCH",
      body: toWriteBody(input),
    });
    return assertPost(payload);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/panel/admin/blog/posts/${id}/`, {
      method: "DELETE",
    });
  },

  async moderateComment(
    postId: number,
    commentId: number,
    approved: boolean,
  ): Promise<BlogPost> {
    await apiRequest<unknown>(
      `/panel/admin/blog/posts/${postId}/comments/${commentId}/moderate/`,
      {
        method: "POST",
        body: { approved },
      },
    );
    return this.get(postId);
  },
};
