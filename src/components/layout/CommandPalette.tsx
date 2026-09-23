"use client";

import { useRouter } from "next/navigation";
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Users,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { routes } from "@/lib/routes";

const pages = [
  { href: routes.root, label: "پیشخوان", icon: LayoutDashboard },
  { href: routes.customers, label: "مشتریان", icon: Users },
  { href: routes.enrollments, label: "ثبت‌نام‌ها", icon: ClipboardList },
  { href: routes.payments, label: "پرداخت‌ها", icon: CreditCard },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="جستجوی صفحات پنل…" />
      <CommandList>
        <CommandEmpty>نتیجه‌ای پیدا نشد.</CommandEmpty>
        <CommandGroup heading="صفحات">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.href}
                value={page.label}
                onSelect={() => {
                  router.push(page.href);
                  onOpenChange(false);
                }}
              >
                <Icon className="size-4" />
                {page.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
