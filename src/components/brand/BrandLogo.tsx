import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  /** @deprecated use size */
  height?: number;
  alt?: string;
  priority?: boolean;
};

export function BrandLogo({
  className,
  size,
  height,
  alt = "کلاسور",
  priority = false,
}: BrandLogoProps) {
  const px = size ?? height ?? 40;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/kelaasor-mark.png"
      alt={alt}
      width={px}
      height={px}
      className={cn("shrink-0 rounded-xl object-cover", className)}
      style={{ width: px, height: px }}
      decoding="async"
      {...(priority
        ? { fetchPriority: "high" as const, loading: "eager" as const }
        : { loading: "lazy" as const })}
    />
  );
}
