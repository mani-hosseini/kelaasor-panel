"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSetBootcampMedias } from "@/lib/api/queries";
import type { BootcampMedia } from "@/lib/api/types";

let localId = -1;

export function MediaEditor({
  bootcampId,
  initial,
}: {
  bootcampId: number;
  initial: BootcampMedia[];
}) {
  const [medias, setMedias] = useState<BootcampMedia[]>(() => structuredClone(initial));
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [mediaType, setMediaType] = useState<BootcampMedia["mediaType"]>("image");
  const save = useSetBootcampMedias();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        تصویر معرفی، ویدیو و فایل‌های دوره در بخش Moments صفحه بوت‌کمپ استفاده می‌شوند.
      </p>
      <div className="grid gap-3 rounded-2xl border border-dashed border-border p-4 sm:grid-cols-4">
        <Input placeholder="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          dir="ltr"
          placeholder="/media/..."
          value={file}
          onChange={(e) => setFile(e.target.value)}
        />
        <Select
          value={mediaType}
          onValueChange={(value) => setMediaType(value as BootcampMedia["mediaType"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">تصویر</SelectItem>
            <SelectItem value="video">ویدیو</SelectItem>
            <SelectItem value="file">فایل</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={() => {
            if (!title.trim() || !file.trim()) {
              toast.error("عنوان و مسیر فایل لازم است");
              return;
            }
            localId -= 1;
            setMedias((prev) => [
              ...prev,
              { id: localId, title: title.trim(), file: file.trim(), mediaType },
            ]);
            setTitle("");
            setFile("");
          }}
        >
          <Plus className="size-4" />
          افزودن
        </Button>
      </div>

      <div className="space-y-2">
        {medias.length === 0 ? (
          <p className="text-sm text-muted-foreground">رسانه‌ای ثبت نشده.</p>
        ) : null}
        {medias.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {item.file}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{item.mediaType}</Badge>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => setMedias((prev) => prev.filter((row) => row.id !== item.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        disabled={save.isPending}
        onClick={() =>
          save.mutate(
            { id: bootcampId, medias },
            { onSuccess: () => toast.success("رسانه‌ها ذخیره شد") },
          )
        }
      >
        ذخیره رسانه
      </Button>
    </div>
  );
}
