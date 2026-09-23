"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
  ClipboardList,
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
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <BrandLogo size={collapsed ? 36 : 44} className="rounded-2xl ring-1 ring-white/10" />
          {!collapsed ? (
            <div className="min-w-0 text-right">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold tracking-wide">کلاسور</p>
                <span className="rounded-md bg-orange/20 px-1.5 py-0.5 text-[10px] font-semibold text-orange">
                  ADMIN
                </span>
              </div>
              <p className="truncate text-xs text-white/55">کنترل‌پنل بوت‌کمپ</p>
            </div>
          ) : null}
        </div>
      </div>

      {!collapsed ? (
        <div className="px-4 pb-3">
          <div className="flex items-start gap-2.5 rounded-2xl border border-brand-300/20 bg-brand-400/10 px-3 py-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange text-white">
              <Sparkles className="size-3.5" />
            </span>
            <div className="min-w-0 text-right">
              <p className="text-xs font-semibold">صف عملیات امروز</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">
                مشتریان منتظر تماس و تأیید را از پیشخوان ببینید.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Separator className="mx-4 w-auto bg-white/10" />

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="px-3 pb-2 text-right text-[11px] font-semibold tracking-wide text-white/40">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={item.label}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-all",
                      active ? "bg-white text-brand-900 shadow-lg" : "text-white/75 hover:bg-white/8 hover:text-white",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && !collapsed ? (
                      <span className="absolute top-1/2 start-0 h-6 w-1 -translate-y-1/2 rounded-e-full bg-orange" />
                    ) : null}
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        active ? "bg-brand/10 text-brand" : "bg-white/8 text-white/80",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    {!collapsed ? (
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className={cn("block truncate text-[11px]", active ? "text-brand/60" : "text-white/40")}>
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

      <div className="space-y-3 border-t border-white/10 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5">
            <Avatar className="size-10 rounded-xl">
              <AvatarFallback className="rounded-xl bg-brand-300/20 text-brand-100">
                {initials(adminName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold">{adminName}</p>
              <p className="text-[11px] text-white/45">مدیر سیستم</p>
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
          className="h-10 w-full justify-start rounded-xl text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
        >
          <LogOut className="size-4" />
          {!collapsed ? "خروج از حساب" : null}
        </Button>
      </div>
    </aside>
  );
}

export const mobileNav = [
  { href: routes.root, label: "پیشخوان", icon: LayoutDashboard },
  { href: routes.customers, label: "مشتریان", icon: Users },
  { href: routes.enrollments, label: "ثبت‌نام", icon: ClipboardList },
  { href: routes.payments, label: "پرداخت", icon: CreditCard },
] as const;
