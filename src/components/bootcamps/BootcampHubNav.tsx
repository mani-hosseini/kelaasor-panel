"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Building2, Handshake, Tags } from "lucide-react";

import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const tabs = [
  {
    href: routes.bootcamps,
    label: "بوت‌کمپ‌ها",
    icon: BookOpen,
    match: (pathname: string) => {
      if (
        pathname.startsWith(routes.topics) ||
        pathname.startsWith(routes.sponsors) ||
        pathname.startsWith(routes.partners)
      ) {
        return false;
      }
      return pathname === routes.bootcamps || pathname.startsWith(`${routes.bootcamps}/`);
    },
  },
  {
    href: routes.topics,
    label: "موضوع‌ها",
    icon: Tags,
    match: (pathname: string) => pathname.startsWith(routes.topics),
  },
  {
    href: routes.sponsors,
    label: "حامی‌ها",
    icon: Handshake,
    match: (pathname: string) => pathname.startsWith(routes.sponsors),
  },
  {
    href: routes.partners,
    label: "شرکا",
    icon: Building2,
    match: (pathname: string) => pathname.startsWith(routes.partners),
  },
] as const;

export function BootcampHubNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card/80 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
