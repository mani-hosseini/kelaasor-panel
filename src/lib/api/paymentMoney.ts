import type { Payment } from "@/lib/api/types";

/** Amount still due after coupon (total stays the pre-coupon contract amount). */
export function payableAmount(payment: Pick<Payment, "totalAmount" | "couponDiscount">) {
  return Math.max(0, payment.totalAmount - (payment.couponDiscount ?? 0));
}

/** Coupon can only apply when there is at least one unpaid installment. */
export function hasUnpaidInstallments(payment: Pick<Payment, "installments">) {
  return payment.installments.some((item) => !item.isPaid);
}
