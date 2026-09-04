import { cn } from "@/lib/utils";

export function KelaasorMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl brand-gradient text-white shadow-lift",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="size-[62%]" fill="none" aria-hidden>
        <path
          d="M8 6h6.2c4.6 0 7.8 2.8 7.8 7.1 0 2.8-1.4 5-3.7 6.1L24.8 26h-5.2l-5.8-6.6H13V26H8V6Zm5 8.8h1.4c2.1 0 3.4-1.1 3.4-2.9S16.5 9 14.4 9H13v5.8Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
