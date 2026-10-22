import { normalizeEnrollment } from "@/lib/api/customers.api";
import { apiRequest } from "@/lib/api/http";
import { unwrapData, unwrapList } from "@/lib/api/normalize";
import type { Enrollment, EnrollmentStatus, ListParams } from "@/lib/api/types";

function assertEnrollment(payload: unknown): Enrollment {
  const item = normalizeEnrollment(unwrapData(payload));
  if (!item) throw new Error("پاسخ ثبت‌نام معتبر نیست");
  return item;
}

export const enrollmentsApi = {
  async list(params?: ListParams): Promise<Enrollment[]> {
    const payload = await apiRequest<unknown>("/panel/admin/enrollments/", {
      searchParams: {
        search: params?.search,
        status: params?.status,
        bootcamp_id: params?.bootcampId,
      },
    });
    return unwrapList(payload, ["enrollments"])
      .map(normalizeEnrollment)
      .filter((item): item is Enrollment => item != null);
  },

  async get(id: number): Promise<Enrollment> {
    const payload = await apiRequest<unknown>(`/panel/admin/enrollments/${id}/`);
    return assertEnrollment(payload);
  },

  async updateStatus(
    id: number,
    status: EnrollmentStatus,
    notes?: string,
  ): Promise<Enrollment> {
    const payload = await apiRequest<unknown>(
      `/panel/admin/enrollments/${id}/update-status/`,
      {
        method: "POST",
        body: {
          status,
          notes: notes ?? "",
        },
      },
    );
    return assertEnrollment(payload);
  },
};
