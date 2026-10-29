"use client";

import { Database } from "lucide-react";

import { isMockMode } from "@/lib/api/mode";

/** Visible when NEXT_PUBLIC_USE_MOCK=true so staff know data is seed, not production. */
export function MockModeBanner() {
  if (!isMockMode()) return null;

  return (
    <div
      dir="rtl"
      className="flex items-center gap-2 border-b border-amber-300/70 bg-amber-50 px-4 py-2 text-xs text-amber-950"
    >
      <Database className="size-3.5 shrink-0 text-amber-600" />
      <p>
        <span className="font-semibold">حالت ماک فعال است</span>
        {" — "}
        دادهٔ seed لوکال برای همهٔ بخش‌ها؛ برای API واقعی در{" "}
        <code className="rounded bg-amber-100 px-1">.env.local</code> مقدار{" "}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_USE_MOCK</code> را{" "}
        <code className="rounded bg-amber-100 px-1">false</code> کنید یا حذف کنید.
      </p>
    </div>
  );
}
