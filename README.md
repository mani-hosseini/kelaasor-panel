# پنل ادمین کلاسور

کنترل‌پنل مدیریت بوت‌کمپ، ثبت‌نام، پرداخت و محتوای سایت [کلاسور](https://kelaasor.com).

## اجرا

```bash
cd kelaasor-panel
cp .env.example .env.local   # در صورت نیاز
npm install
npm run dev
```

`NEXT_PUBLIC_API_BASE_URL` باید **همان مقدار camp** باشد (مثلاً `https://api.kelaasor.com`).

ورود با ایمیل و رمز اکانت `is_staff` روی `/panel/admin/auth/login/` انجام می‌شود. دادهٔ پنل از همان API سرور می‌آید، مگر `NEXT_PUBLIC_USE_MOCK=true` باشد.

مستندات panel: [Swagger panel](https://api.kelaasor.com/swagger/docs/#/panel)

## معماری API (hybrid)

| لایه | نقش |
|------|-----|
| `adminApi` (`src/lib/api/client.ts`) | تنها ورودی UI / React Query |
| `*.api.ts` + `apiRequest` | ماژول‌های live با cookie auth |
| `normalize.ts` / `mediaUrl.ts` / `labels.ts` | نرمال‌سازی داینامیک پاسخ بک‌اند و fallback لیبل |
| `mock/store` | فقط ماژول‌هایی که هنوز وصل نشده‌اند |

با `NEXT_PUBLIC_USE_MOCK=false` همهٔ ماژول‌های پنل (ورود، پیشخوان، مشتری، ثبت‌نام، پرداخت، هزینه، گواهی، بوت‌کمپ، بلاگ، مدرس، موضوع، حامی، شریک، تسک، صفحات و تنظیمات) از API سرور می‌آیند. برای هر ماژول جدید:

1. فایل `src/lib/api/<module>.api.ts` با `apiRequest` + نرمالایزر
2. جایگزینی همان متدها داخل `adminApi` (بدون دست زدن به hooks/UI مگر لازم شود)
3. ترجیح فیلدهای `*_display` و لیست‌های بک‌اند نسبت به لیبل هاردکد

## ماژول‌ها

- پیشخوان و مراحل ثبت‌نام
- صف ثبت‌نام و تأیید پرداخت
- بوت‌کمپ، مدرس، کاربر / مشتری (CRM)
- گواهی، تنظیمات، پارتنر
- بلاگ، موضوع، حامی
