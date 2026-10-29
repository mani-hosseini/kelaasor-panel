import { AlertTriangle } from "lucide-react";

/** Shown on modules that still read/write the local mock store (no panel API yet). */
export function MockDataBanner({ module }: { module: string }) {
  return (
    <div
      dir="rtl"
      className="flex items-start gap-3 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <div className="text-right">
        <p className="font-semibold">دادهٔ ماک — {module}</p>
        <p className="mt-0.5 text-xs text-amber-900/80">
          این بخش هنوز endpoint پنل روی API ندارد؛ لیست و تغییرات فقط در حافظهٔ مرورگر شبیه‌سازی می‌شود و با رفرش از بین می‌رود.
        </p>
      </div>
    </div>
  );
}
