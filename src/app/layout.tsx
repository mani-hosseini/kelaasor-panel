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

/**
 * Local dev only: the API's auth cookies are SameSite=Lax, so they're sent only
 * when the panel and the API share a host. With the API on 127.0.0.1 (kept
 * apart from the student site on localhost), a panel opened on localhost would
 * log in "successfully" and then get 401 on every request — so hop over to
 * 127.0.0.1 before anything runs.
 */
function devHostRedirectScript() {
  if (process.env.NODE_ENV !== "development") return null;
  let apiHost = "";
  try {
    apiHost = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "").hostname;
  } catch {}
  if (apiHost !== "127.0.0.1") return null;
  return `if (location.hostname === "localhost") { location.replace(location.href.replace("//localhost", "//127.0.0.1")); }`;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      {devHostRedirectScript() ? (
        <head>
          <script dangerouslySetInnerHTML={{ __html: devHostRedirectScript()! }} />
        </head>
      ) : null}
      <body className="min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
