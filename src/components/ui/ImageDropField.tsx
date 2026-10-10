"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_FILE_MB = 5;

type ImageDropFieldProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  className?: string;
  accept?: string;
  maxMb?: number;
  /** Allow clearing back to empty. */
  clearable?: boolean;
};

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود"));
    reader.readAsDataURL(file);
  });
}

function isPreviewable(value: string | null | undefined) {
  if (!value) return false;
  return (
    value.startsWith("data:image/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("blob:")
  );
}

export function ImageDropField({
  value,
  onChange,
  label = "تصویر",
  className,
  accept = DEFAULT_ACCEPT,
  maxMb = MAX_FILE_MB,
  clearable = true,
}: ImageDropFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!value) setFileName(null);
  }, [value]);

  async function pickFile(file: File | null) {
    setError("");
    if (!file) {
      onChange(null);
      setFileName(null);
      return;
    }

    const allowed = accept.split(",").map((part) => part.trim());
    if (!allowed.includes(file.type)) {
      setError("فرمت تصویر مجاز نیست (JPG، PNG، WebP، GIF)");
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setError(`حداکثر حجم فایل ${maxMb} مگابایت است`);
      return;
    }

    try {
      const dataUrl = await readAsDataUrl(file);
      setFileName(file.name);
      onChange(dataUrl);
    } catch {
      setError("خواندن فایل ناموفق بود");
    }
  }

  const preview = isPreviewable(value) ? value : null;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-sm font-medium">{label}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          void pickFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />

      {preview ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[16/9] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={label}
              className="size-full object-cover"
            />
            {clearable ? (
              <button
                type="button"
                className="absolute start-2 top-2 inline-flex size-8 items-center justify-center rounded-lg bg-black/55 text-white hover:bg-black/70"
                onClick={() => {
                  void pickFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                aria-label="حذف تصویر"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <p className="truncate text-xs text-muted-foreground" dir="ltr">
              {fileName ?? (value?.startsWith("data:") ? "تصویر انتخاب‌شده" : value)}
            </p>
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-brand hover:underline"
              onClick={() => inputRef.current?.click()}
            >
              تعویض
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void pickFile(event.dataTransfer.files?.[0] ?? null);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors",
            dragging
              ? "border-brand bg-brand/5"
              : "border-border bg-muted/30 hover:border-brand/40 hover:bg-muted/50",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            {dragging ? (
              <Upload className="size-5" strokeWidth={1.75} />
            ) : (
              <ImagePlus className="size-5" strokeWidth={1.75} />
            )}
          </span>
          <span className="text-sm font-medium">کشیدن و رها کردن یا انتخاب تصویر</span>
          <span className="text-[11px] text-muted-foreground">
            JPG، PNG، WebP، GIF · حداکثر {maxMb}MB
          </span>
        </button>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
