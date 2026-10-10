"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  ClipboardList,
  CreditCard,
  FileText,
  Globe2,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { clearSessionCookie } from "@/lib/auth";
import { isNavActive, routes } from "@/lib/routes";
import { cn, initials } from "@/lib/utils";

const groups = [
  {
    label: "عملیات",
    items: [
      { href: routes.root, label: "پیشخوان", description: "نمای کلی کسب‌وکار", icon: LayoutDashboard },
      { href: routes.customers, label: "مشتریان", description: "یادداشت، تماس و مراحل", icon: Users },
      { href: routes.enrollments, label: "ثبت‌نام‌ها", description: "صف تأیید", icon: ClipboardList },
      { href: routes.payments, label: "پرداخت‌ها", description: "فیش، چک و اقساط", icon: CreditCard },
      { href: routes.certificates, label: "گواهی‌ها", description: "صدور و ابطال", icon: Award },
    ],
  },
  {
    label: "آموزش",
    items: [
      {
        href: routes.bootcamps,
        label: "بوت‌کمپ‌ها",
        description: "دوره، موضوع، حامی و شرکا",
        icon: BookOpen,
      },
      { href: routes.instructors, label: "مدرس‌ها", description: "منتور و مربی", icon: UserRound },
    ],
  },
  {
    label: "محتوا و تنظیمات",
    items: [
      { href: routes.blog, label: "بلاگ", description: "پست و کامنت", icon: FileText },
      {
        href: routes.site,
        label: "صفحات سایت",
        description: "درباره ما و تماس با ما",
        icon: Globe2,
      },
      { href: routes.settings, label: "تنظیمات", description: "بانک و LMS", icon: Settings },
    ],
  },
];

type AdminSidebarProps = {
  adminName: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({ adminName, collapsed, onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-l border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="px-3.5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={collapsed ? 32 : 38} className="rounded-xl ring-1 ring-white/10" />
          {!collapsed ? (
            <div className="min-w-0 text-right">
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-bold tracking-wide">کلاسور</p>
                <span className="rounded bg-orange/20 px-1 py-px text-[9px] font-semibold text-orange">
                  ADMIN
                </span>
              </div>
              <p className="truncate text-[11px] text-white/55">کنترل‌پنل بوت‌کمپ</p>
            </div>
          ) : null}
        </div>
      </div>

      {!collapsed ? (
        <div className="px-3.5 pb-2.5">
          <div className="flex items-start gap-2 rounded-xl border border-brand-300/15 bg-brand-400/10 px-2.5 py-2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-orange text-white">
              <Sparkles className="size-3" />
            </span>
            <div className="min-w-0 text-right">
              <p className="text-[11px] font-semibold">صف عملیات امروز</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-white/55">
                پیگیری، فیش و گواهی را از پیشخوان ببینید.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Separator className="mx-3.5 w-auto bg-white/10" />

      <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="px-2.5 pb-1.5 text-right text-[10px] font-semibold tracking-wide text-white/35">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={`${item.label} — ${item.description}`}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-right transition-all",
                      active
                        ? "bg-white text-brand-900 shadow-sm"
                        : "text-white/75 hover:bg-white/8 hover:text-white",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && !collapsed ? (
                      <span className="absolute top-1/2 start-0 h-4 w-0.5 -translate-y-1/2 rounded-e-full bg-orange" />
                    ) : null}
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-brand/10 text-brand" : "bg-white/8 text-white/75",
                      )}
                    >
                      <Icon className="size-3.5" strokeWidth={1.75} />
                    </span>
                    {!collapsed ? (
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold leading-5">{item.label}</span>
                        <span
                          className={cn(
                            "block truncate text-[10px] leading-4",
                            active ? "text-brand/55" : "text-white/35",
                          )}
                        >
                          {item.description}
                        </span>
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-brand-300/20 text-xs text-brand-100">
                {initials(adminName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-right">
              <p className="truncate text-[13px] font-semibold">{adminName}</p>
              <p className="text-[10px] text-white/45">مدیر سیستم</p>
            </div>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearSessionCookie();
            router.replace(routes.login);
          }}
          className="h-8 w-full justify-start rounded-lg text-xs text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
        >
          <LogOut className="size-3.5" />
          {!collapsed ? "خروج از حساب" : null}
        </Button>
      </div>
    </aside>
  );
}

export const mobileNav = [
  { href: routes.root, label: "پیشخوان", icon: LayoutDashboard },
  { href: routes.customers, label: "مشتریان", icon: Users },
  { href: routes.payments, label: "پرداخت", icon: CreditCard },
  { href: routes.bootcamps, label: "بوت‌کمپ", icon: BookOpen },
] as const;
