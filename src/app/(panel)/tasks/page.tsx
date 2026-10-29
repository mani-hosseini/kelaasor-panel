"use client";

import { TaskBoard } from "@/components/tasks/TaskBoard";
import { PageHeader } from "@/components/layout/PageHeader";

export default function TasksPage() {
  return (
    <div dir="rtl" className="space-y-5 text-right">
      <PageHeader
        eyebrow="عملیات"
        title="تسک‌ها"
        description="صف کار روزانه: تماس ناقص و پیگیری‌ها خودکار، بقیه را خودتان اضافه کنید."
      />
      <TaskBoard />
    </div>
  );
}
