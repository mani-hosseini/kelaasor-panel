# پنل ادمین کلاسور

کنترل‌پنل مدیریت بوت‌کمپ، ثبت‌نام، پرداخت و محتوای سایت [کلاسور](https://kelaasor.com).

## اجرا

```bash
cd kelaasor-panel
npm install
npm run dev
```

ورود دمو:

- ایمیل: `staff@kelaasor.com`
- رمز: `KelaasorAdmin!2026`

## معماری

فرانت Next.js 16 + TypeScript. داده فعلاً mock است (`NEXT_PUBLIC_API_MODE=mock`) و لایه `adminApi` برای اتصال بعدی به Django آماده است.

## ماژول‌ها

- پیشخوان و مراحل ثبت‌نام
- صف ثبت‌نام و تأیید پرداخت
- بوت‌کمپ، مدرس، کاربر
- بلاگ، موضوع، حامی
