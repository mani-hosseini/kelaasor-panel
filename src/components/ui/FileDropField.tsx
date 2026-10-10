"use client";

import { useRef, useState } from "react";
import { FileUp, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

type FileDropFieldProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  className?: string;
  accept?: string;
  maxMb?: number;
  hint?: string;
};

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود"));
    reader.readAsDataURL(file);
  });
}

export function FileDropField({
  value,
  onChange,
  label = "فایل",
  className,
  accept = "*/*",
  maxMb = 20,
  hint,
}: FileDropFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  async function pickFile(file: File | null) {
    setError("");
    if (!file) {
      onChange(null);
      setFileName(null);
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

      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <FileUp className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-medium">{fileName ?? "فایل انتخاب‌شده"}</p>
            <p className="truncate text-[11px] text-muted-foreground" dir="ltr">
              {value.startsWith("data:") ? "آماده ارسال (لوکال)" : value}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => {
              void pickFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="حذف فایل"
          >
            <X className="size-4" />
          </button>
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
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center transition-colors",
            dragging
              ? "border-brand bg-brand/5"
              : "border-border bg-muted/30 hover:border-brand/40",
          )}
        >
          <Upload className="size-5 text-brand" strokeWidth={1.75} />
          <span className="text-sm font-medium">کشیدن و رها کردن یا انتخاب فایل</span>
          <span className="text-[11px] text-muted-foreground">
            {hint ?? `حداکثر ${maxMb}MB`}
          </span>
        </button>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
