"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Copy, Phone, Star, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ActivityTimeline } from "@/components/customers/ActivityTimeline";
import { CustomerProfileForm } from "@/components/customers/CustomerProfileForm";
import { EnrollmentPipeline } from "@/components/customers/EnrollmentPipeline";
import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
import { StageActions } from "@/components/enrollments/StageActions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { bootcampTitle } from "@/lib/api/client";
import {
  useAddCustomerCall,
  useAddCustomerNote,
  useCustomer,
  useDeleteCustomerNote,
  useSetCustomerFollowUp,
  useSetCustomerTags,
  useToggleCustomerStar,
  useUpdateUser,
} from "@/lib/api/queries";
import {
  CALL_OUTCOME,
  ENROLLMENT_STATUS,
  type CallOutcome,
} from "@/lib/api/types";
import { callOutcomeLabels } from "@/lib/api/mock/seed";
import { formatJalaliDate, formatJalaliDateTime, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = useCustomer(id);
  const updateUser = useUpdateUser();
  const addNote = useAddCustomerNote();
  const deleteNote = useDeleteCustomerNote();
  const addCall = useAddCustomerCall();
  const toggleStar = useToggleCustomerStar();
  const setFollowUp = useSetCustomerFollowUp();
  const setTags = useSetCustomerTags();

  const [noteBody, setNoteBody] = useState("");
  const [callSummary, setCallSummary] = useState("");
  const [callOutcome, setCallOutcome] = useState<CallOutcome>(CALL_OUTCOME.ANSWERED);
  const [callDuration, setCallDuration] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  if (isLoading) return <Skeleton className="h-96" />;
  if (!data) {
    return (
      <div className="space-y-4">
        <PageHeader backHref={routes.customers} title="مشتری پیدا نشد" description="این پرونده در داده‌های فعلی نیست." />
        <Button asChild variant="outline">
          <Link href={routes.customers}>بازگشت به مشتریان</Link>
        </Button>
      </div>
    );
  }

  const { user, enrollments, notes, calls, activity } = data;
  const activeEnrollment =
    enrollments.find(
      (item) =>
        item.status !== ENROLLMENT_STATUS.CANCELED &&
        item.status !== ENROLLMENT_STATUS.CONFIRMED,
    ) ?? enrollments[0];
  const enrollmentForActions =
    enrollments.find((item) => String(item.id) === selectedEnrollmentId) ?? activeEnrollment;

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <PageHeader
        backHref={routes.customers}
        eyebrow="پرونده مشتری"
        title={`${user.firstName} ${user.lastName}`}
        description={`${user.phoneNumber} · ${user.email}`}
        actions={
          <div className="flex flex-wrap items-center justify-start gap-2">
            {activeEnrollment ? <EnrollmentStatusBadge status={activeEnrollment.status} /> : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toggleStar.mutate(id, {
                  onSuccess: () =>
                    toast.success(user.isStarred ? "از نشان‌شده‌ها حذف شد" : "نشان شد"),
                })
              }
            >
              <Star className={cn("size-4", user.isStarred && "fill-orange text-orange")} />
              {user.isStarred ? "نشان‌شده" : "نشان‌کردن"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(user.phoneNumber);
                toast.success("شماره کپی شد");
              }}
            >
              <Copy className="size-4" />
              کپی موبایل
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={`tel:${user.phoneNumber}`}>
                <Phone className="size-4" />
                تماس
              </a>
            </Button>
            <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-2">
              <span className="text-sm">حساب فعال</span>
              <Switch
                checked={user.isActive}
                onCheckedChange={(isActive) =>
                  updateUser.mutate(
                    { id, isActive },
                    { onSuccess: () => toast.success(isActive ? "فعال شد" : "غیرفعال شد") },
                  )
                }
              />
            </div>
          </div>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>یادآوری پیگیری</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={followUpInput || user.followUpAt?.slice(0, 10) || ""}
                onChange={(event) => setFollowUpInput(event.target.value)}
              />
              <Button
                size="sm"
                disabled={setFollowUp.isPending}
                onClick={() => {
                  const value = followUpInput || user.followUpAt?.slice(0, 10) || null;
                  setFollowUp.mutate(
                    { userId: id, followUpAt: value },
                    { onSuccess: () => toast.success("یادآوری ذخیره شد") },
                  );
                }}
              >
                ذخیره
              </Button>
            </div>
            {user.followUpAt ? (
              <p className="text-[11px] text-muted-foreground">
                فعلی: {formatJalaliDate(user.followUpAt)}
              </p>
            ) : null}
            {user.followUpAt ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  setFollowUp.mutate(
                    { userId: id, followUpAt: null },
                    { onSuccess: () => {
                      setFollowUpInput("");
                      toast.success("یادآوری پاک شد");
                    } },
                  )
                }
              >
                پاک کردن یادآوری
              </Button>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <Label>برچسب‌های CRM</Label>
            <div className="flex flex-wrap gap-2">
              {user.crmTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-danger"
                    onClick={() =>
                      setTags.mutate(
                        {
                          userId: id,
                          crmTags: user.crmTags.filter((item) => item !== tag),
                        },
                        { onSuccess: () => toast.success("برچسب حذف شد") },
                      )
                    }
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="مثلاً VIP یا اقساط"
              />
              <Button
                size="sm"
                disabled={!tagInput.trim() || setTags.isPending}
                onClick={() => {
                  const next = [...user.crmTags, tagInput.trim()];
                  setTags.mutate(
                    { userId: id, crmTags: next },
                    {
                      onSuccess: () => {
                        setTagInput("");
                        toast.success("برچسب اضافه شد");
                      },
                    },
                  );
                }}
              >
                افزودن
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="profile">ویرایش پروفایل</TabsTrigger>
          <TabsTrigger value="timeline">تایم‌لاین ({toFa(activity.length)})</TabsTrigger>
          <TabsTrigger value="stages">مراحل ثبت‌نام</TabsTrigger>
          <TabsTrigger value="notes">یادداشت‌ها ({toFa(notes.length)})</TabsTrigger>
          <TabsTrigger value="calls">تماس‌ها ({toFa(calls.length)})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات حساب</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="موبایل" value={user.phoneNumber} ltr />
                <Info label="ایمیل" value={user.email} ltr />
                <Info label="جنسیت" value={user.genderDisplay} />
                <Info label="عضویت" value={formatJalaliDate(user.createdAt)} />
                <Info label="کد ملی" value={user.profile.nationalId ?? "—"} ltr />
                <Info label="تاریخ تولد" value={user.profile.birthDate ?? "—"} />
                <Info
                  label="نام انگلیسی"
                  value={
                    [user.profile.englishFirstName, user.profile.englishLastName]
                      .filter(Boolean)
                      .join(" ") || "—"
                  }
                  ltr
                />
                <Info label="تحصیلات" value={user.profile.educationLevelDisplay ?? "—"} />
                <Info label="رشته" value={user.profile.fieldOfStudy ?? "—"} />
                <Info label="لینکدین" value={user.profile.linkedinUrl ?? "—"} ltr />
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">آدرس</p>
                  <p className="mt-1 font-medium">{user.profile.address ?? "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">تجربه قبلی</p>
                  <p className="mt-1 font-medium">
                    {user.profile.hasPriorExperience
                      ? user.profile.experienceDescription ?? "دارد"
                      : "ندارد"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ثبت‌نام‌های بوت‌کمپ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ثبت‌نامی ندارد.</p>
                ) : null}
                {enrollments.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0 text-right">
                      <p className="text-sm font-semibold">{bootcampTitle(item.bootcampId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatJalaliDateTime(item.enrolledAt)} · گام بعدی: {item.nextStepByDisplay}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnrollmentStatusBadge status={item.status} />
                      <Button asChild size="sm" variant="outline">
                        <Link href={routes.enrollment(item.id)}>جزئیات</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="size-4 text-brand" />
                  آخرین یادداشت‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="rounded-2xl border border-border px-3 py-2.5 text-sm">
                    <p>{note.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {note.authorName} · {formatJalaliDateTime(note.createdAt)}
                    </p>
                  </div>
                ))}
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">یادداشتی ثبت نشده.</p>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="size-4 text-brand" />
                  آخرین تماس‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {calls.slice(0, 3).map((call) => (
                  <div key={call.id} className="rounded-2xl border border-border px-3 py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">{call.outcomeLabel}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {formatJalaliDateTime(call.calledAt)}
                      </span>
                    </div>
                    <p className="mt-2">{call.summary}</p>
                  </div>
                ))}
                {calls.length === 0 ? (
                  <p className="text-sm text-muted-foreground">تماسی ثبت نشده.</p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اصلاح اطلاعات ثبت‌نام نهایی</CardTitle>
              <p className="text-sm text-muted-foreground">
                مشاور می‌تواند فیلدهایی که دانشجو اشتباه وارد کرده را از اینجا درست کند.
              </p>
            </CardHeader>
            <CardContent>
              <CustomerProfileForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تایم‌لاین فعالیت مشتری</CardTitle>
              <p className="text-sm text-muted-foreground">
                یادداشت‌ها، تماس‌ها، ثبت‌نام‌ها و یادآوری‌ها در یک نمای زمانی.
              </p>
            </CardHeader>
            <CardContent>
              <ActivityTimeline items={activity} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>مراحل ثبت‌نام سایت کلاسور</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  همان مراحلی که کاربر در حساب کاربری طی می‌کند؛ ادمین می‌تواند وضعیت را جلو/عقب ببرد.
                </p>
              </div>
              {enrollments.length > 1 ? (
                <Select
                  value={selectedEnrollmentId || String(enrollmentForActions?.id ?? "")}
                  onValueChange={setSelectedEnrollmentId}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="انتخاب ثبت‌نام" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {bootcampTitle(item.bootcampId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-5">
              {!enrollmentForActions ? (
                <p className="text-sm text-muted-foreground">ثبت‌نام فعالی برای این مشتری نیست.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">بوت‌کمپ:</span>
                    <span className="font-semibold">{bootcampTitle(enrollmentForActions.bootcampId)}</span>
                    <EnrollmentStatusBadge status={enrollmentForActions.status} />
                    <Badge variant="secondary">گام بعدی: {enrollmentForActions.nextStepByDisplay}</Badge>
                  </div>
                  <EnrollmentPipeline currentStatus={enrollmentForActions.status} />
                  {enrollmentForActions.notes ? (
                    <p className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">
                      یادداشت ثبت‌نام: {enrollmentForActions.notes}
                    </p>
                  ) : null}
                  <StageActions
                    enrollmentId={enrollmentForActions.id}
                    currentStatus={enrollmentForActions.status}
                    columns={2}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ثبت یادداشت ادمین</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder="نکته داخلی درباره این مشتری…"
              />
              <Button
                disabled={addNote.isPending || !noteBody.trim()}
                onClick={() =>
                  addNote.mutate(
                    { userId: id, body: noteBody },
                    {
                      onSuccess: () => {
                        setNoteBody("");
                        toast.success("یادداشت ذخیره شد");
                      },
                      onError: (error) => toast.error(error.message),
                    },
                  )
                }
              >
                ذخیره یادداشت
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm leading-relaxed">{note.body}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {note.authorName} · {formatJalaliDateTime(note.createdAt)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-rose-500"
                    disabled={deleteNote.isPending}
                    onClick={() =>
                      deleteNote.mutate(
                        { noteId: note.id, userId: id },
                        { onSuccess: () => toast.success("حذف شد") },
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">هنوز یادداشتی نیست.</p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ثبت تماس / گفتگو</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>خلاصه صحبت</Label>
                <Textarea
                  value={callSummary}
                  onChange={(event) => setCallSummary(event.target.value)}
                  placeholder="چه چیزی گفته شد؟ توافق بعدی چیست؟"
                />
              </div>
              <div className="space-y-2">
                <Label>نتیجه تماس</Label>
                <Select
                  value={callOutcome}
                  onValueChange={(value) => setCallOutcome(value as CallOutcome)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(callOutcomeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مدت (دقیقه)</Label>
                <Input
                  type="number"
                  min={0}
                  value={callDuration}
                  onChange={(event) => setCallDuration(event.target.value)}
                  placeholder="مثلاً ۸"
                />
              </div>
              {enrollments.length > 0 ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label>مرتبط با ثبت‌نام</Label>
                  <Select
                    value={selectedEnrollmentId || String(activeEnrollment?.id ?? "")}
                    onValueChange={setSelectedEnrollmentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب ثبت‌نام" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrollments.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {bootcampTitle(item.bootcampId)} — {item.statusLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <Button
                  disabled={addCall.isPending || !callSummary.trim()}
                  onClick={() => {
                    const enrollmentId = Number(
                      selectedEnrollmentId || activeEnrollment?.id || 0,
                    );
                    addCall.mutate(
                      {
                        userId: id,
                        enrollmentId: enrollmentId || null,
                        outcome: callOutcome,
                        summary: callSummary,
                        durationMinutes: callDuration ? Number(callDuration) : null,
                      },
                      {
                        onSuccess: () => {
                          setCallSummary("");
                          setCallDuration("");
                          toast.success("تماس ثبت شد");
                        },
                        onError: (error) => toast.error(error.message),
                      },
                    );
                  }}
                >
                  ثبت تماس
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {calls.map((call) => (
              <Card key={call.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{call.outcomeLabel}</Badge>
                      {call.durationMinutes != null ? (
                        <span className="text-xs text-muted-foreground">
                          {toFa(call.durationMinutes)} دقیقه
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatJalaliDateTime(call.calledAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{call.summary}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {call.authorName}
                    {call.enrollmentId
                      ? ` · ثبت‌نام #${toFa(call.enrollmentId)}`
                      : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
            {calls.length === 0 ? (
              <p className="text-sm text-muted-foreground">هنوز تماسی ثبت نشده.</p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="text-right">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium" dir={ltr ? "ltr" : "rtl"}>
        {value}
      </p>
    </div>
  );
}
