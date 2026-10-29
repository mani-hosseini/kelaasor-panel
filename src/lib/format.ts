const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(value: string | number) {
  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

export function formatToman(amount: number | null | undefined) {
  if (amount == null) return "—";
  return `${toFa(amount.toLocaleString("en-US"))} تومان`;
}

/** Compact toman for charts/KPIs — e.g. ۱۲٫۴ میلیون */
export function formatTomanCompact(amount: number | null | undefined) {
  if (amount == null) return "—";
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `${toFa((amount / 1_000_000_000).toFixed(1))} میلیارد`;
  }
  if (abs >= 1_000_000) {
    return `${toFa((amount / 1_000_000).toFixed(1))} میلیون`;
  }
  if (abs >= 1_000) {
    return `${toFa(Math.round(amount / 1_000).toLocaleString("en-US"))} هزار`;
  }
  return toFa(amount);
}

export function formatJalaliDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Season + Jalali year from a date, e.g. «پاییز ۱۴۰۴» (matches backend jalali_session). */
export function formatJalaliSession(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const monthRaw = parts.find((part) => part.type === "month")?.value;
  const month = Number(monthRaw);
  if (!year || !month) return null;

  const season =
    month <= 3 ? "بهار" : month <= 6 ? "تابستان" : month <= 9 ? "پاییز" : "زمستان";

  return `${season} ${toFa(year)}`;
}

export function formatJalaliDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPercent(value: number) {
  return `${toFa(Math.round(value))}٪`;
}

export function relativeDay(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "امروز";
  if (days === 1) return "دیروز";
  return `${toFa(days)} روز پیش`;
}
