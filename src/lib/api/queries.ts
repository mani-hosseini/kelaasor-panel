import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminApi } from "@/lib/api/client";
import type {
  BlogPostInput,
  Bootcamp,
  BootcampInput,
  EnrollmentStatus,
  InstructorInput,
  ListParams,
  SponsorInput,
  TopicInput,
} from "@/lib/api/types";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  enrollments: (params?: ListParams) => ["enrollments", params] as const,
  enrollment: (id: number) => ["enrollment", id] as const,
  payments: (params?: ListParams) => ["payments", params] as const,
  payment: (id: number) => ["payment", id] as const,
  bootcamps: (params?: ListParams) => ["bootcamps", params] as const,
  bootcamp: (id: number) => ["bootcamp", id] as const,
  users: (params?: ListParams) => ["users", params] as const,
  user: (id: number) => ["user", id] as const,
  instructors: (params?: ListParams) => ["instructors", params] as const,
  instructor: (id: number) => ["instructor", id] as const,
  blog: (params?: ListParams) => ["blog", params] as const,
  blogPost: (id: number) => ["blog-post", id] as const,
  blogCategories: ["blog-categories"] as const,
  topics: ["topics"] as const,
  sponsors: ["sponsors"] as const,
};

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: adminApi.dashboard.stats });
}

export function useEnrollments(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.enrollments(params),
    queryFn: () => adminApi.enrollments.list(params),
  });
}

export function useEnrollment(id: number) {
  return useQuery({
    queryKey: queryKeys.enrollment(id),
    queryFn: () => adminApi.enrollments.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useUpdateEnrollmentStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; status: EnrollmentStatus; notes?: string }) =>
      adminApi.enrollments.updateStatus(input.id, input.status, input.notes),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["enrollments"] });
      await client.invalidateQueries({ queryKey: ["enrollment"] });
      await client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function usePayments(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.payments(params),
    queryFn: () => adminApi.payments.list(params),
  });
}

export function usePayment(id: number) {
  return useQuery({
    queryKey: queryKeys.payment(id),
    queryFn: () => adminApi.payments.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useVerifyPayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; approved: boolean }) =>
      adminApi.payments.verify(input.id, input.approved),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });
}

export function useMarkInstallmentPaid() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { paymentId: number; installmentId: number }) =>
      adminApi.payments.markInstallmentPaid(input.paymentId, input.installmentId),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });
}

export function useBootcamps(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.bootcamps(params),
    queryFn: () => adminApi.bootcamps.list(params),
  });
}

export function useBootcamp(id: number) {
  return useQuery({
    queryKey: queryKeys.bootcamp(id),
    queryFn: () => adminApi.bootcamps.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateBootcamp() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: BootcampInput) => adminApi.bootcamps.create(input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["bootcamps"] });
    },
  });
}

export function useUpdateBootcamp() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; data: Partial<BootcampInput> & Partial<Bootcamp> }) =>
      adminApi.bootcamps.update(input.id, input.data),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["bootcamps"] });
      await client.invalidateQueries({ queryKey: ["bootcamp"] });
    },
  });
}

export function useDeleteBootcamp() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.bootcamps.remove(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["bootcamps"] });
    },
  });
}

export function useUsers(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => adminApi.users.list(params),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => adminApi.users.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useUpdateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; isActive?: boolean; firstName?: string; lastName?: string }) =>
      adminApi.users.update(input.id, input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["users"] });
      await client.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useInstructors(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.instructors(params),
    queryFn: () => adminApi.instructors.list(params),
  });
}

export function useInstructor(id: number) {
  return useQuery({
    queryKey: queryKeys.instructor(id),
    queryFn: () => adminApi.instructors.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useSaveInstructor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: number; data: InstructorInput }) =>
      input.id
        ? adminApi.instructors.update(input.id, input.data)
        : adminApi.instructors.create(input.data),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["instructors"] });
      await client.invalidateQueries({ queryKey: ["instructor"] });
    },
  });
}

export function useDeleteInstructor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.instructors.remove(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["instructors"] });
    },
  });
}

export function useBlog(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.blog(params),
    queryFn: () => adminApi.blog.list(params),
  });
}

export function useBlogPost(id: number) {
  return useQuery({
    queryKey: queryKeys.blogPost(id),
    queryFn: () => adminApi.blog.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: queryKeys.blogCategories,
    queryFn: adminApi.blog.categories,
  });
}

export function useSaveBlog() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: number; data: BlogPostInput }) =>
      input.id ? adminApi.blog.update(input.id, input.data) : adminApi.blog.create(input.data),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["blog"] });
      await client.invalidateQueries({ queryKey: ["blog-post"] });
    },
  });
}

export function useDeleteBlog() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.blog.remove(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["blog"] });
    },
  });
}

export function useModerateComment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { postId: number; commentId: number; approved: boolean }) =>
      adminApi.blog.moderateComment(input.postId, input.commentId, input.approved),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["blog-post"] });
    },
  });
}

export function useTopics() {
  return useQuery({ queryKey: queryKeys.topics, queryFn: adminApi.topics.list });
}

export function useSaveTopic() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: number; data: TopicInput }) =>
      input.id ? adminApi.topics.update(input.id, input.data) : adminApi.topics.create(input.data),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.topics });
    },
  });
}

export function useDeleteTopic() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.topics.remove(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.topics });
    },
  });
}

export function useSponsors() {
  return useQuery({ queryKey: queryKeys.sponsors, queryFn: adminApi.sponsors.list });
}

export function useSaveSponsor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: number; data: SponsorInput }) =>
      input.id
        ? adminApi.sponsors.update(input.id, input.data)
        : adminApi.sponsors.create(input.data),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.sponsors });
    },
  });
}

export function useDeleteSponsor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.sponsors.remove(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.sponsors });
    },
  });
}
