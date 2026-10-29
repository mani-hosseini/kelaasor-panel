import type { Payment } from "@/lib/api/types";

const STORAGE_KEY = "kelaasor_payment_coupons_v1";

function readMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const amount = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(amount) && amount >= 0) out[key] = amount;
    }
    return out;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getStoredCouponDiscount(paymentId: number): number {
  return readMap()[String(paymentId)] ?? 0;
}

export function setStoredCouponDiscount(paymentId: number, amount: number) {
  const map = readMap();
  const next = Math.max(0, Math.round(amount));
  if (next <= 0) delete map[String(paymentId)];
  else map[String(paymentId)] = next;
  writeMap(map);
}

export function payableAmount(payment: Pick<Payment, "totalAmount" | "couponDiscount">) {
  return Math.max(0, payment.totalAmount - (payment.couponDiscount ?? 0));
}

/** Merge persisted panel coupon onto a payment from API/mock. */
export function withCouponOverlay(payment: Payment): Payment {
  const stored = getStoredCouponDiscount(payment.id);
  const couponDiscount = Math.max(payment.couponDiscount ?? 0, stored);
  return { ...payment, couponDiscount };
}
