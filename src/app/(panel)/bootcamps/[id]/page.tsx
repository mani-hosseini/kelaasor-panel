"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { BootcampForm } from "@/components/bootcamps/BootcampForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockStore } from "@/lib/api/mock/store";
import { useBootcamp, useDeleteBootcamp, useUpdateBootcamp } from "@/lib/api/queries";
import { formatJalaliDate, formatToman, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function BootcampDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { data, isLoading } = useBootcamp(id);
  const update = useUpdateBootcamp();
  const remove = useDeleteBootcamp();

  if (isLoading || !data) return <Skeleton className="h-96" />;

  const topic = mockStore.listTopics().find((item) => item.id === data.topicId);
  const instructors = mockStore.listInstructors().filter((item) => data.instructorIds.includes(item.id));
  const sponsors = mockStore.listSponsors().filter((item) => data.sponsorIds.includes(item.id));

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={routes.bootcamps}
        eyebrow={topic?.title}
        title={data.title}
        description={data.brief}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={routes.bootcampEdit(data.id)}>ویرایش فرم کامل</Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                remove.mutate(data.id, {
                  onSuccess: () => {
                    toast.success("حذف شد");
                    router.push(routes.bootcamps);
                  },
                })
              }
            >
              حذف
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">مشخصات</TabsTrigger>
          <TabsTrigger value="syllabus">سیلابس</TabsTrigger>
          <TabsTrigger value="people">مدرس و حامی</TabsTrigger>
          <TabsTrigger value="media">رسانه</TabsTrigger>
          <TabsTrigger value="cohort">وضعیت ثبت‌نام</TabsTrigger>
          <TabsTrigger value="edit">ویرایش</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 text-sm">
              <Info label="مدت" value={`${toFa(data.durationInWeeks)} هفته`} />
              <Info label="ظرفیت" value={toFa(data.capacity)} />
              <Info label="اقساط" value={data.hasBnpl ? "فعال" : "غیرفعال"} />
              <Info label="اسلاگ" value={data.slug} />
              <p className="sm:col-span-2 leading-7 text-muted-foreground">{data.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus">
          <Card>
            <CardHeader>
              <CardTitle>فصل‌ها و درس‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.chapters.length === 0 ? (
                <p className="text-sm text-muted-foreground">سیلابس هنوز وارد نشده.</p>
              ) : (
                data.chapters.map((chapter) => (
                  <div key={chapter.id} className="rounded-2xl border border-border p-4">
                    <p className="font-semibold">{chapter.title}</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {chapter.lessons.map((lesson) => (
                        <li key={lesson.id}>— {lesson.title}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>مدرس‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {instructors.length === 0 ? <p className="text-sm text-muted-foreground">منتوری وصل نشده.</p> : null}
                {instructors.map((item) => (
                  <Link key={item.id} href={routes.instructor(item.id)} className="block rounded-2xl border border-border p-3 hover:bg-muted/50">
                    <p className="font-semibold">{item.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.jobTitle} — {item.company}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>حامی‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sponsors.length === 0 ? <p className="text-sm text-muted-foreground">حامیی ثبت نشده.</p> : null}
                {sponsors.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border px-3 py-2 text-sm">
                    {item.name}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardContent className="space-y-2 p-5">
              {data.medias.length === 0 ? <p className="text-sm text-muted-foreground">فایل رسانه‌ای نیست.</p> : null}
              {data.medias.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <Badge variant="secondary">{item.mediaType}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort">
          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 text-sm">
              {data.currentEvent ? (
                <>
                  <Info label="وضعیت" value={data.currentEvent.statusDisplay} />
                  <Info label="قیمت نهایی" value={formatToman(data.currentEvent.finalPrice)} />
                  <Info label="شروع" value={formatJalaliDate(data.currentEvent.startDate)} />
                  <Info label="پایان" value={formatJalaliDate(data.currentEvent.endDate)} />
                  <Info label="برنامه" value={`${data.currentEvent.sessionsScheduleDays} — ${data.currentEvent.sessionsScheduleHours}`} />
                  <Info
                    label="ثبت‌نام"
                    value={`${toFa(data.currentEvent.confirmedEnrollmentsCount)} تأیید از ${toFa(data.currentEvent.totalEnrollmentsCount)}`}
                  />
                </>
              ) : (
                <p>وضعیت ثبت‌نام فعالی نیست.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardContent className="p-5">
              <BootcampForm
                initial={data}
                submitting={update.isPending}
                onSubmit={(values) =>
                  update.mutate(
                    { id, data: values },
                    { onSuccess: () => toast.success("ذخیره شد") },
                  )
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
