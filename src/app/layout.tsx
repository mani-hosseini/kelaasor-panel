import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

import { AppProviders } from "@/components/providers/AppProviders";

import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "پنل ادمین کلاسور",
    template: "%s | کلاسور",
  },
  description: "کنترل‌پنل مدیریت بوت‌کمپ، ثبت‌نام و پرداخت کلاسور",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
