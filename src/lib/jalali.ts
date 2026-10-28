/**
 * Jalali (Solar Hijri) ↔ Gregorian conversion — the jdf algorithm, valid for
 * any date this panel will ever see. Months are 1-based on both sides.
 */

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/** Saturday-first, as on Iranian calendars. */
export const JALALI_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

export type JalaliDate = { year: number; month: number; day: number };

const div = (a: number, b: number) => Math.trunc(a / b);

export function toJalali(date: Date): JalaliDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const monthOffsets = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    monthOffsets[gm - 1];
  let year = -1595 + 33 * div(days, 12053);
  days %= 12053;
  year += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    year += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  return days < 186
    ? { year, month: 1 + div(days, 31), day: 1 + (days % 31) }
    : { year, month: 7 + div(days - 186, 30), day: 1 + ((days - 186) % 30) };
}

/** Local-time Date at midnight of the given Jalali day. */
export function fromJalali({ year, month, day }: JalaliDate): Date {
  let days =
    -355668 +
    365 * (year + 1595) +
    div(year + 1595, 33) * 8 +
    div(((year + 1595) % 33) + 3, 4) +
    day +
    (month < 7 ? (month - 1) * 31 : (month - 7) * 30 + 186);
  let gy = 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    days -= 1;
    gy += 100 * div(days, 36524);
    days %= 36524;
    if (days >= 365) days += 1;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const monthLengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 12 && gd > monthLengths[gm]) {
    gd -= monthLengths[gm];
    gm += 1;
  }
  return new Date(gy, gm, gd);
}

export function jalaliMonthLength(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  // Esfand has 30 days in leap years: 30 Esfand exists iff it doesn't roll over.
  return toJalali(fromJalali({ year, month: 12, day: 30 })).month === 12 ? 30 : 29;
}

/** Column of a date in a Saturday-first week (0 = شنبه … 6 = جمعه). */
export function jalaliWeekdayIndex(date: Date) {
  return (date.getDay() + 1) % 7;
}

export function isSameJalaliDay(a: JalaliDate, b: JalaliDate) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}
