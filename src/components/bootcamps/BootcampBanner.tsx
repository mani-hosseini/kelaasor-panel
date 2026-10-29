"use client";

import { normalizeMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";

/** Themed fallback when a bootcamp has no uploaded banner. */
export const BOOTCAMP_BANNER_FALLBACK = "/images/bootcamp-banner-fallback.jpg";

type Props = {
  banner?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function BootcampBanner({
  banner,
  alt,
  className,
  imageClassName,
}: Props) {
  const src = normalizeMediaUrl(banner) || BOOTCAMP_BANNER_FALLBACK;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn("size-full object-cover", imageClassName)}
      />
    </div>
  );
}
