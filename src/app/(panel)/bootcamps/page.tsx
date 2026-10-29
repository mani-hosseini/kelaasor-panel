"use client";

import Link from "next/link";

import { BootcampCatalogManager } from "@/components/bootcamps/BootcampCatalogManager";
import { BootcampTopicDirectory } from "@/components/bootcamps/BootcampTopicDirectory";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useBootcamps, useTopics } from "@/lib/api/queries";
import { routes } from "@/lib/routes";

export default function BootcampsPage() {
  const bootcampsQuery = useBootcamps();
  const topicsQuery = useTopics();

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        eyebrow="آموزش"
        title="بوت‌کمپ‌ها"
        description="دوره‌ها بر اساس موضوع بخش‌بندی شده‌اند؛ هر موضوع می‌تواند چند ترم با وضعیت متفاوت داشته باشد."
        actions={
          <Button asChild>
            <Link href={routes.bootcampNew}>بوت‌کمپ جدید</Link>
          </Button>
        }
      />

      <BootcampTopicDirectory
        bootcamps={bootcampsQuery.data ?? []}
        topics={topicsQuery.data ?? []}
        loading={bootcampsQuery.isLoading || topicsQuery.isLoading}
      />

      <BootcampCatalogManager />
    </div>
  );
}
