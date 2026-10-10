import type { AboutPageContent, ContactPageContent } from "@/lib/site-content/types";

/** Seeded from kelaasor-camp `/about` + `/contact` constants. */
export const defaultAboutContent: AboutPageContent = {
  hero: {
    sharedText:
      "کلاسور با هدف توانمندسازی نسل جدید متخصصان فناوری شکل گرفته است. ما با ترکیب آموزش پروژه‌محور، منتورینگ تخصصی و شبکه‌سازی حرفه‌ای، مسیر ورود شما به بازار کار را هموار می‌کنیم.",
    rightHeading: "با کلاسور همراه باشید...",
    rightButtonText: "تماس با ما",
    leftHeading: "درباره ما بیشتر بدانید...",
    leftButtonText: "مشاهده بوت‌کمپ‌ها",
    image: "/home/banner.png",
    imageAlt: "تصویر معرفی کلاسور",
  },
  features: [
    { id: "support", text: "پشتیبانی ۲۴ ساعته" },
    { id: "quality", text: "منتورینگ تخصصی" },
    { id: "price", text: "مسیرهای یادگیری متنوع" },
    { id: "network", text: "شبکه‌سازی حرفه‌ای" },
  ],
  newsletter: {
    title: "عضویت در خبرنامه ما",
    description:
      "با عضویت در خبرنامه کلاسور، از جدیدترین بوت‌کمپ‌ها، رویدادها و مقالات آموزشی مطلع شوید.",
    placeholder: "آدرس پست الکترونیک خود را وارد کنید...",
    submitLabel: "ارسال",
  },
  testimonials: [
    {
      id: "review-1",
      name: "ویدا محمدی",
      date: "۲۳ آبان ۱۴۰۱",
      avatar: "/home/Avatar.png",
      quote:
        "کلاسور بهترین تصمیم من برای ورود به حوزه محصول بود. سرفصل‌ها دقیق و کاربردی بود و منتورها واقعاً در مسیر رشدم کمک کردند.",
      rating: 4.5,
    },
    {
      id: "review-2",
      name: "علی کرمی",
      date: "۲۳ آبان ۱۴۰۱",
      avatar: "/home/Avatar.png",
      quote:
        "ترکیب کلاس‌های نظری و پروژه‌های عملی باعث شد مهارت‌هایم را در محیطی شبیه به بازار کار واقعی تقویت کنم.",
      rating: 4,
    },
    {
      id: "review-3",
      name: "محمد رسولی",
      date: "۲۳ آبان ۱۴۰۱",
      avatar: "/home/Avatar.png",
      quote: "شبکه‌سازی با هم‌دوره‌ای‌ها و اساتید، بزرگ‌ترین دستاورد این بوت‌کمپ برای من بود.",
      rating: 4,
    },
  ],
  contactBlock: {
    title: "اطلاعات تماس با ما",
    description:
      "برای دریافت مشاوره ثبت‌نام، همکاری یا هرگونه سوال، از راه‌های زیر با تیم کلاسور در ارتباط باشید.",
    items: [
      { id: "email", label: "ایمیل", value: "info@kelaasor.com" },
      { id: "phone", label: "تلفن پشتیبانی", value: "021-1234567" },
    ],
  },
  faqs: [
    {
      id: "faq-1",
      question: "آیا امکان پیش‌ثبت‌نام در بوت‌کمپ‌ها وجود دارد؟",
      answer:
        "بله، برای بسیاری از بوت‌کمپ‌ها امکان پیش‌ثبت‌نام رایگان وجود دارد تا از ظرفیت و زمان شروع دوره مطلع شوید.",
    },
    {
      id: "faq-2",
      question: "آیا امکان پرداخت اقساطی وجود دارد؟",
      answer: "بله، برای برخی بوت‌کمپ‌ها امکان پرداخت در چند قسط ماهانه فراهم است.",
    },
    {
      id: "faq-3",
      question: "آیا گواهینامه پایان دوره ارائه می‌شود؟",
      answer:
        "بله، پس از اتمام موفق بوت‌کمپ و انجام پروژه نهایی، گواهینامه معتبر کلاسور به شما اعطا می‌شود.",
    },
  ],
};

export const defaultContactContent: ContactPageContent = {
  hero: {
    eyebrow: "ارتباط با کلاسور",
    heading: "با ما در ارتباط باشید",
    description:
      "تیم پشتیبانی کلاسور آماده پاسخگویی به سوالات شما درباره بوت‌کمپ‌ها، ثبت‌نام و همکاری است. از طریق راه‌های ارتباطی زیر با ما در تماس باشید و در سریع‌ترین زمان پاسخ خود را دریافت کنید.",
    primaryCtaText: "مشاهده بوت‌کمپ‌ها",
    secondaryCtaText: "درباره ما",
    image: "/logo-kelaasor-02.png",
    imageAlt: "لوگوی کلاسور",
  },
  info: {
    title: "اطلاعات تماس",
    description:
      "برای دریافت مشاوره ثبت‌نام، همکاری یا هرگونه سوال، از راه‌های زیر با تیم کلاسور در ارتباط باشید.",
    items: [
      { id: "email", label: "ایمیل", value: "info@kelaasor.com" },
      { id: "phone", label: "تلفن پشتیبانی", value: "09216556270" },
      { id: "hours", label: "ساعات کاری", value: "از ۸ صبح تا ۸ شب" },
    ],
    socialTitle: "ما را دنبال کنید",
    socialLinks: [
      {
        id: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/kelaasor/posts/",
      },
      { id: "instagram", label: "Instagram", href: "https://instagram.com/kelaasor/" },
      { id: "twitter", label: "X", href: "https://x.com/kelaasor" },
      { id: "telegram", label: "Telegram", href: "https://t.me/kelaasor" },
    ],
  },
  map: {
    title: "نشانی ما روی نقشه",
    description:
      "محل برگزاری بوتکمپ‌ها، جلسات و منتورینگ تخصصی کلاسور در نشانی زیر است، منتظر دیدارتون هستیم.",
    address:
      "تهران، خیابان آزادی، خیابان حبیب اله، بالاتر از میدان حسینی، پلاک 56، ایستگاه نوآوری شریف",
    embedUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=51.35266%2C35.70467%2C51.35866%2C35.70867&layer=mapnik&marker=35.706669%2C51.355655",
  },
  form: {
    title: "پیام خود را برای ما بفرستید",
    subtitle: "انتقادات و پیشنهادات خود را با ما در میان بگذارید.",
    footerNote: "پاسخ شما در کوتاه‌ترین زمان ارسال خواهد شد.",
    submitLabel: "ارسال پیام",
    firstName: "نام",
    lastName: "نام خانوادگی",
    email: "ایمیل",
    phone: "شماره تماس",
    subject: "موضوع پیام",
    message: "متن پیام",
  },
};
