import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminApi } from "@/lib/api/client";
import type {
  BlogPostInput,
  Bootcamp,
  BootcampInput,
  CallOutcome,
  EnrollmentStatus,
  InstructorInput,
  ListParams,
  SponsorInput,
  TopicInput,
  UserUpdateInput,
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
  customers: (params?: ListParams) => ["customers", params] as const,
  customer: (id: number) => ["customer", id] as const,
  instructors: (params?: ListParams) => ["instructors", params] as const,
  instructor: (id: number) => ["instructor", id] as const,
  blog: (params?: ListParams) => ["blog", params] as const,
  blogPost: (id: number) => ["blog-post", id] as const,
  blogCategories: ["blog-categories"] as const,
  topics: ["topics"] as const,
  sponsors: ["sponsors"] as const,
  partners: ["partners"] as const,
  certificates: (params?: ListParams) => ["certificates", params] as const,
  certificate: (id: number) => ["certificate", id] as const,
  settings: ["settings"] as const,
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
      await client.invalidateQueries({ queryKey: ["customers"] });
      await client.invalidateQueries({ queryKey: ["customer"] });
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

export function useRejectInstallment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { paymentId: number; installmentId: number }) =>
      adminApi.payments.rejectInstallment(input.paymentId, input.installmentId),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });
}

export function useCertificates(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.certificates(params),
    queryFn: () => adminApi.certificates.list(params),
  });
}

export function useCertificate(id: number) {
  return useQuery({
    queryKey: queryKeys.certificate(id),
    queryFn: () => adminApi.certificates.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useIssueCertificate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => adminApi.certificates.issue(enrollmentId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["certificates"] });
      await client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useRevokeCertificate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.certificates.revoke(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["certificates"] });
      await client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useSettings() {
  return useQuery({ queryKey: queryKeys.settings, queryFn: adminApi.settings.get });
}

export function useUpdateSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<import("@/lib/api/types").AppSettings>) =>
      adminApi.settings.update(patch),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.settings });
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

export function useSetBootcampChapters() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; chapters: Bootcamp["chapters"] }) =>
      adminApi.bootcamps.setChapters(input.id, input.chapters),
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({ queryKey: queryKeys.bootcamp(variables.id) });
      await client.invalidateQueries({ queryKey: ["bootcamps"] });
    },
  });
}

export function useSetBootcampMedias() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; medias: Bootcamp["medias"] }) =>
      adminApi.bootcamps.setMedias(input.id, input.medias),
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({ queryKey: queryKeys.bootcamp(variables.id) });
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
    mutationFn: (input: { id: number } & UserUpdateInput) =>
      adminApi.users.update(input.id, input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["users"] });
      await client.invalidateQueries({ queryKey: ["user"] });
      await client.invalidateQueries({ queryKey: ["customers"] });
      await client.invalidateQueries({ queryKey: ["customer"] });
    },
  });
}

export function useCustomers(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.customers(params),
    queryFn: () => adminApi.customers.list(params),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => adminApi.customers.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useAddCustomerNote() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: number; body: string }) =>
      adminApi.customers.addNote(input.userId, input.body),
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({ queryKey: queryKeys.customer(variables.userId) });
      await client.invalidateQueries({ queryKey: ["customers"] });
      await client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteCustomerNote() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { noteId: number; userId: number }) =>
      adminApi.customers.deleteNote(input.noteId),
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({ queryKey: queryKeys.customer(variables.userId) });
      await client.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useAddCustomerCall() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      userId: number;
      enrollmentId?: number | null;
      calledAt?: string;
      durationMinutes?: number | null;
      outcome: CallOutcome;
      summary: string;
    }) => adminApi.customers.addCall(input),
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({ queryKey: queryKeys.customer(variables.userId) });
      await client.invalidateQueries({ queryKey: ["customers"] });
      await client.invalidateQueries({ queryKey: ["enrollments"] });
      await client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useToggleCustomerStar() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.customers.toggleStar(userId),
    onSuccess: async (_data, userId) => {
      await client.invalidateQueries({ queryKey: queryKeys.customer(userId) });
      await client.invalidateQueries({ queryKey: ["customers"] });
      await client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useSetCustomerFollowUp() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: number; followUpAt: string | null }) =>
      adminApi.customers.setFollowUp(input.userId, input.followUpAt),
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({ queryKey: queryKeys.customer(variables.userId) });
      await client.invalidateQueries({ queryKey: ["customers"] });
      await client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useSetCustomerTags() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: number; crmTags: string[] }) =>
      adminApi.customers.setTags(input.userId, input.crmTags),
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({ queryKey: queryKeys.customer(variables.userId) });
      await client.invalidateQueries({ queryKey: ["customers"] });
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

export function usePartners() {
  return useQuery({ queryKey: queryKeys.partners, queryFn: adminApi.partners.list });
}

export function useSavePartner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id?: number;
      data: import("@/lib/api/types").PartnerCompanyInput;
    }) =>
      input.id
        ? adminApi.partners.update(input.id, input.data)
        : adminApi.partners.create(input.data),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.partners });
    },
  });
}

export function useDeletePartner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.partners.remove(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.partners });
    },
  });
}
