"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetBootcampChapters } from "@/lib/api/queries";
import type { BootcampChapter } from "@/lib/api/types";

let localId = -1;
function nextLocalId() {
  localId -= 1;
  return localId;
}

export function SyllabusEditor({
  bootcampId,
  initial,
}: {
  bootcampId: number;
  initial: BootcampChapter[];
}) {
  const [chapters, setChapters] = useState<BootcampChapter[]>(() =>
    structuredClone(initial),
  );
  const save = useSetBootcampChapters();

  function addChapter() {
    setChapters((prev) => [
      ...prev,
      { id: nextLocalId(), title: "فصل جدید", ordering: prev.length + 1, lessons: [] },
    ]);
  }

  function addLesson(chapterId: number) {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              lessons: [
                ...chapter.lessons,
                {
                  id: nextLocalId(),
                  title: "درس جدید",
                  ordering: chapter.lessons.length + 1,
                },
              ],
            }
          : chapter,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          سیلابس همان چیزی است که در صفحه بوت‌کمپ سایت کلاسور دیده می‌شود.
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addChapter}>
            <Plus className="size-4" />
            فصل
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={save.isPending}
            onClick={() =>
              save.mutate(
                { id: bootcampId, chapters },
                { onSuccess: () => toast.success("سیلابس ذخیره شد") },
              )
            }
          >
            ذخیره سیلابس
          </Button>
        </div>
      </div>

      {chapters.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز فصلی نیست — یک فصل اضافه کنید.</p>
      ) : null}

      {chapters.map((chapter, chapterIndex) => (
        <div key={chapter.id} className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex gap-2">
            <Input
              value={chapter.title}
              onChange={(event) =>
                setChapters((prev) =>
                  prev.map((item) =>
                    item.id === chapter.id ? { ...item, title: event.target.value } : item,
                  ),
                )
              }
              placeholder={`عنوان فصل ${chapterIndex + 1}`}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() =>
                setChapters((prev) => prev.filter((item) => item.id !== chapter.id))
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="space-y-2 pe-2 ps-4">
            {chapter.lessons.map((lesson) => (
              <div key={lesson.id} className="flex gap-2">
                <Input
                  value={lesson.title}
                  onChange={(event) =>
                    setChapters((prev) =>
                      prev.map((item) =>
                        item.id === chapter.id
                          ? {
                              ...item,
                              lessons: item.lessons.map((row) =>
                                row.id === lesson.id
                                  ? { ...row, title: event.target.value }
                                  : row,
                              ),
                            }
                          : item,
                      ),
                    )
                  }
                  placeholder="عنوان درس"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    setChapters((prev) =>
                      prev.map((item) =>
                        item.id === chapter.id
                          ? {
                              ...item,
                              lessons: item.lessons.filter((row) => row.id !== lesson.id),
                            }
                          : item,
                      ),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => addLesson(chapter.id)}>
              <Plus className="size-4" />
              درس
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
