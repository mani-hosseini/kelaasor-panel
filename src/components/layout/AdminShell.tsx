"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { CrmQuickActions } from "@/components/layout/CrmQuickActions";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { AdminSidebar, mobileNav } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/api/queries";
import { isNavActive } from "@/lib/routes";
import { toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/customers") || pathname.startsWith("/users")) return "مشتریان";
  if (pathname.startsWith("/enrollments")) return "ثبت‌نام‌ها";
  if (pathname.startsWith("/payments")) return "پرداخت‌ها";
  if (pathname.startsWith("/certificates")) return "گواهی‌ها";
  if (pathname.startsWith("/bootcamps")) return "بوت‌کمپ‌ها";
  if (pathname.startsWith("/instructors")) return "مدرس‌ها";
  if (pathname.startsWith("/topics")) return "موضوع‌ها";
  if (pathname.startsWith("/sponsors")) return "حامی‌ها";
  if (pathname.startsWith("/partners")) return "شرکای صفحه اصلی";
  if (pathname.startsWith("/blog")) return "بلاگ";
  if (pathname.startsWith("/settings")) return "تنظیمات";
  return "پیشخوان";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const stats = useDashboard();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pending = stats.data?.pendingAdminActions ?? 0;

  return (
    <div dir="rtl" className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-[96rem]">
        <div className="sticky top-0 hidden h-dvh w-72 shrink-0 lg:block">
          <AdminSidebar adminName="مدیر کلاسور" className="h-full" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/80 bg-card/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-8">
              <div className="flex min-w-0 items-center gap-2.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setOpen(true)}
                  aria-label="منو"
                >
                  <Menu className="size-5" />
                </Button>
                <div className="flex items-center gap-2 lg:hidden">
                  <BrandLogo size={32} className="rounded-lg" />
                  <p className="text-sm font-bold">کلاسور</p>
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="text-xs text-muted-foreground">پنل ادمین</p>
                  <p className="text-sm font-bold">{resolveTitle(pathname)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CrmQuickActions className="hidden items-center gap-1.5 md:flex" />
                <Button
                  variant="outline"
                  className="hidden h-10 min-w-52 justify-between rounded-xl text-muted-foreground xl:inline-flex"
                  onClick={() => setCommandOpen(true)}
                >
                  <span className="inline-flex items-center gap-2">
                    <Search className="size-4" />
                    جستجو
                  </span>
                  <kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
                </Button>
                <Button variant="outline" size="icon" className="xl:hidden" onClick={() => setCommandOpen(true)}>
                  <Search className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="size-4" />
                  {pending > 0 ? (
                    <span className="absolute -top-1 -left-1 grid min-w-4 place-items-center rounded-full bg-orange px-1 text-[10px] text-white">
                      {toFa(pending)}
                    </span>
                  ) : null}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-3 py-5 pb-24 sm:px-5 lg:px-8 lg:pb-8">
            <CrmQuickActions className="mb-4 flex items-center gap-1.5 md:hidden" />
            {children}
          </main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-brand-950/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 end-0 w-80 max-w-[85vw]">
            <div className="absolute top-3 left-3 z-10">
              <Button size="icon" variant="outline" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <AdminSidebar adminName="مدیر کلاسور" className="h-full" onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 p-1 backdrop-blur lg:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-2 text-[11px]",
                active ? "bg-brand/10 text-brand" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
