"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, Phone } from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: routes.siteAbout,
    label: "درباره ما",
    icon: Info,
  },
  {
    href: routes.siteContact,
    label: "تماس با ما",
    icon: Phone,
  },
] as const;

export function SitePagesNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card/80 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
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
