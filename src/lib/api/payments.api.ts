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
import type { ListParams, Payment, PaymentInstallment } from "@/lib/api/types";

function normalizeInstallment(item: unknown): PaymentInstallment | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  if (id == null) return null;

  const receiptRaw =
    asStr(item.payment_receipt) ?? asStr(item.paymentReceipt);

  return {
    id,
    installmentNumber:
      asNum(item.installment_number) ?? asNum(item.installmentNumber) ?? 0,
    amount: asNum(item.amount) ?? 0,
    dueDate: asStr(item.due_date) ?? asStr(item.dueDate) ?? "",
    isPaid: asBool(item.is_paid ?? item.isPaid),
    paidAt: asStr(item.paid_at) ?? asStr(item.paidAt),
    paymentReceipt: receiptRaw ? normalizeMediaUrl(receiptRaw) : null,
    awaitingVerification: asBool(
      item.awaiting_verification ?? item.awaitingVerification,
    ),
  };
}

function inferVerified(item: Record<string, unknown>, paidPercentage: number) {
  if (item.verified !== undefined) return asBool(item.verified);
  const status = (
    asStr(item.payment_status) ??
    asStr(item.paymentStatus) ??
    ""
  ).toLowerCase();
  if (
    status.includes("verified") ||
    status.includes("تأیید") ||
    status.includes("پرداخت‌شده") ||
    status.includes("پرداخت شده")
  ) {
    return true;
  }
  return paidPercentage >= 100;
}

function normalizePayment(item: unknown): Payment | null {
  if (!isObj(item)) return null;
  const id = asNum(item.id);
  const enrollmentId = asNum(item.enrollment_id) ?? asNum(item.enrollmentId);
  const userId = asNum(item.user_id) ?? asNum(item.userId);
  const bootcampId = asNum(item.bootcamp_id) ?? asNum(item.bootcampId);
  if (id == null || enrollmentId == null || userId == null || bootcampId == null) {
    return null;
  }

  const paymentTypeRaw = asNum(item.payment_type) ?? asNum(item.paymentType) ?? 1;
  const paymentType: 1 | 2 = paymentTypeRaw === 2 ? 2 : 1;
  const paidPercentage =
    asNum(item.paid_percentage) ?? asNum(item.paidPercentage) ?? 0;
  const receiptRaw = asStr(item.receipt);
  const chequeRaw = asStr(item.cheque);

  const installments = unwrapList(item.installments ?? [], ["installments"])
    .map(normalizeInstallment)
    .filter((row): row is PaymentInstallment => row != null);

  return {
    id,
    enrollmentId,
    userId,
    bootcampId,
    paymentType,
    paymentStatus:
      asStr(item.payment_status) ?? asStr(item.paymentStatus) ?? "",
    paidPercentage,
    totalAmount: asNum(item.total_amount) ?? asNum(item.totalAmount) ?? 0,
    paidAmount: asNum(item.paid_amount) ?? asNum(item.paidAmount) ?? 0,
    receipt: receiptRaw ? normalizeMediaUrl(receiptRaw) : null,
    cheque: chequeRaw ? normalizeMediaUrl(chequeRaw) : null,
    chequeNumber: asStr(item.cheque_number) ?? asStr(item.chequeNumber),
    verified: inferVerified(item, paidPercentage),
    installments,
  };
}

function assertPayment(payload: unknown): Payment {
  const payment = normalizePayment(unwrapData(payload));
  if (!payment) throw new Error("پاسخ پرداخت معتبر نیست");
  return payment;
}

function matchesAwaiting(payment: Payment) {
  return (
    (!payment.verified && Boolean(payment.receipt)) ||
    payment.installments.some((row) => row.awaitingVerification)
  );
}

export const paymentsApi = {
  async list(params?: ListParams): Promise<Payment[]> {
    const payload = await apiRequest<unknown>("/panel/admin/payments/");
    let items = unwrapList(payload, ["payments"])
      .map(normalizePayment)
      .filter((item): item is Payment => item != null);

    const search = params?.search?.trim().toLowerCase();
    if (search) {
      items = items.filter((item) =>
        `${item.id} ${item.userId} ${item.bootcampId} ${item.paymentStatus} ${item.enrollmentId}`
          .toLowerCase()
          .includes(search),
      );
    }

    if (params?.paymentFilter === "awaiting") {
      items = items.filter(matchesAwaiting);
    } else if (params?.paymentFilter === "installment") {
      items = items.filter((item) => item.paymentType === 2);
    }

    return items;
  },

  async get(id: number): Promise<Payment> {
    const payload = await apiRequest<unknown>(`/panel/admin/payments/${id}/`);
    return assertPayment(payload);
  },

  async verify(id: number, approved: boolean): Promise<Payment> {
    await apiRequest<unknown>(`/panel/admin/payments/${id}/verify/`, {
      method: "POST",
      body: { approved },
    });
    return this.get(id);
  },

  async markInstallmentPaid(
    paymentId: number,
    installmentId: number,
  ): Promise<Payment> {
    await apiRequest<unknown>(
      `/panel/admin/payments/${paymentId}/installments/${installmentId}/mark-paid/`,
      { method: "POST" },
    );
    return this.get(paymentId);
  },

  async rejectInstallment(
    paymentId: number,
    installmentId: number,
  ): Promise<Payment> {
    await apiRequest<unknown>(
      `/panel/admin/payments/${paymentId}/installments/${installmentId}/reject/`,
      { method: "POST" },
    );
    return this.get(paymentId);
  },
};
