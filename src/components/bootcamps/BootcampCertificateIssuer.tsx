"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, CheckSquare, Square, Ticket } from "lucide-react";
import { toast } from "sonner";

import { EnrollmentStatusBadge } from "@/components/enrollments/EnrollmentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLookups } from "@/lib/api/lookups";
import {
  useCertificates,
  useEnrollments,
  useIssueCertificate,
  useRevokeCertificate,
} from "@/lib/api/queries";
import { ENROLLMENT_STATUS } from "@/lib/api/types";
import { formatJalaliDate, toFa } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  bootcampId: number;
};

export function BootcampCertificateIssuer({ bootcampId }: Props) {
  const enrollmentsQuery = useEnrollments({ bootcampId });
  const certificatesQuery = useCertificates();
  const issue = useIssueCertificate();
  const revoke = useRevokeCertificate();
  const { userName } = useAdminLookups();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [issuing, setIssuing] = useState(false);

  const enrollments = useMemo(
    () =>
      (enrollmentsQuery.data ?? []).filter((item) => item.bootcampId === bootcampId),
    [enrollmentsQuery.data, bootcampId],
  );

  const certificates = useMemo(
    () =>
      (certificatesQuery.data ?? []).filter(
        (item) => item.bootcampId === bootcampId && !item.revoked,
      ),
    [certificatesQuery.data, bootcampId],
  );

  const issuedByEnrollment = useMemo(() => {
    const map = new Map<number, (typeof certificates)[number]>();
    for (const cert of certificates) map.set(cert.enrollmentId, cert);
    return map;
  }, [certificates]);

  const eligible = useMemo(
    () =>
      enrollments.filter(
        (item) =>
          item.status === ENROLLMENT_STATUS.CONFIRMED &&
          !issuedByEnrollment.has(item.id),
      ),
    [enrollments, issuedByEnrollment],
  );

  const alreadyIssued = useMemo(
    () =>
      enrollments.filter(
        (item) =>
          item.status === ENROLLMENT_STATUS.CONFIRMED &&
          issuedByEnrollment.has(item.id),
      ),
    [enrollments, issuedByEnrollment],
  );

  function toggle(enrollmentId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === eligible.length) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(eligible.map((item) => item.id)));
  }

  async function issueSelected() {
    const ids = [...selected];
    if (ids.length === 0) {
      toast.message("حداقل یک نفر را انتخاب کنید");
      return;
    }
    setIssuing(true);
    let ok = 0;
    let fail = 0;
    for (const enrollmentId of ids) {
      try {
        await issue.mutateAsync(enrollmentId);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setIssuing(false);
    setSelected(new Set());
    if (ok > 0) toast.success(`${toFa(ok)} گواهی صادر شد`);
    if (fail > 0) toast.error(`${toFa(fail)} مورد ناموفق بود`);
  }

  if (enrollmentsQuery.isLoading || certificatesQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  return (
    <div dir="rtl" className="space-y-4 text-right">
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 text-right">
            <CardTitle className="flex items-center justify-start gap-2">
              <Award className="size-4 shrink-0 text-brand" />
              صدور گواهینامه
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              دانشجوهای تأیید نهایی را انتخاب کنید و برایشان گواهی صادر کنید. گواهی در پرونده
              مشتری هم دیده می‌شود.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={eligible.length === 0}
              onClick={toggleAll}
            >
              {selected.size === eligible.length && eligible.length > 0
                ? "برداشتن انتخاب همه"
                : "انتخاب همه واجدین"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={issuing || selected.size === 0}
              onClick={() => void issueSelected()}
            >
              <Ticket className="size-4" />
              صدور برای {toFa(selected.size)} نفر
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="mb-3 flex flex-wrap justify-start gap-2 text-xs">
            <Badge variant="warning">واجد شرایط: {toFa(eligible.length)}</Badge>
            <Badge variant="success">صادر شده: {toFa(alreadyIssued.length)}</Badge>
            <Badge variant="secondary">انتخاب‌شده: {toFa(selected.size)}</Badge>
          </div>

          {eligible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              دانشجوی تأیید نهایی بدون گواهی برای این بوت‌کمپ نیست.
            </p>
          ) : (
            eligible.map((item) => {
              const checked = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  dir="rtl"
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "flex w-full flex-row items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-right transition",
                    checked
                      ? "border-brand/40 bg-brand/5"
                      : "border-border hover:border-brand/25 hover:bg-muted/40",
                  )}
                >
                  <div className="flex min-w-0 items-center justify-start gap-3">
                    <span className="shrink-0 text-brand">
                      {checked ? (
                        <CheckSquare className="size-5" />
                      ) : (
                        <Square className="size-5 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 text-right">
                      <p className="truncate font-semibold">{userName(item.userId)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        ثبت‌نام #{toFa(item.id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <EnrollmentStatusBadge status={item.status} />
                    <Button asChild size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                      <Link href={routes.customer(item.userId)}>پرونده</Link>
                    </Button>
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>گواهی‌های صادرشده این بوت‌کمپ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alreadyIssued.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز گواهی صادر نشده.</p>
          ) : (
            alreadyIssued.map((item) => {
              const cert = issuedByEnrollment.get(item.id)!;
              return (
                <div
                  key={cert.id}
                  dir="rtl"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-3.5 py-3 text-right"
                >
                  <div className="min-w-0 text-right">
                    <p className="font-semibold">{userName(item.userId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {cert.title} · {formatJalaliDate(cert.issuedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">فعال</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={routes.customer(item.userId)}>مشتری</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={revoke.isPending}
                      onClick={() =>
                        revoke.mutate(cert.id, {
                          onSuccess: () => toast.success("گواهی باطل شد"),
                          onError: (error) => toast.error(error.message),
                        })
                      }
                    >
                      ابطال
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
