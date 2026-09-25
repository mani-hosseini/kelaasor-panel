"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteInstructor, useInstructors, useSaveInstructor } from "@/lib/api/queries";
import type { Instructor, InstructorInput } from "@/lib/api/types";
import { routes } from "@/lib/routes";

const schema = z.object({
  fullName: z.string().min(3),
  jobTitle: z.string().min(3),
  company: z.string().min(2),
  linkedinUrl: z.string().url(),
  bio: z.string().min(8),
  avatar: z.string().nullable(),
  companyLogo: z.string().nullable(),
});

export default function InstructorsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useInstructors({ search });
  const save = useSaveInstructor();
  const remove = useDeleteInstructor();
  const form = useForm<InstructorInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      company: "",
      linkedinUrl: "https://linkedin.com/in/",
      bio: "",
      avatar: null,
      companyLogo: null,
    },
  });

  const columns = useMemo<ColumnDef<Instructor>[]>(
    () => [
      {
        header: "مدرس",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.original.jobTitle}</p>
          </div>
        ),
      },
      { header: "شرکت", cell: ({ row }) => row.original.company ?? "—" },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={routes.instructor(row.original.id)}>جزئیات</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => remove.mutate(row.original.id, { onSuccess: () => toast.success("حذف شد") })}
            >
              حذف
            </Button>
          </div>
        ),
      },
    ],
    [remove],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="آموزش"
        title="مدرس‌ها و منتورها"
        actions={<Button onClick={() => setOpen(true)}>مدرس جدید</Button>}
      />
      <div className="surface-panel p-5">
        {isLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <DataTable columns={columns} data={data} searchValue={search} onSearchChange={setSearch} />
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مدرس جدید</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((values) =>
              save.mutate(
                { data: values },
                {
                  onSuccess: () => {
                    toast.success("اضافه شد");
                    setOpen(false);
                    form.reset();
                  },
                },
              )
            )}
          >
            <Field label="نام"><Input {...form.register("fullName")} /></Field>
            <Field label="عنوان شغلی"><Input {...form.register("jobTitle")} /></Field>
            <Field label="شرکت"><Input {...form.register("company")} /></Field>
            <Field label="لینکدین"><Input dir="ltr" {...form.register("linkedinUrl")} /></Field>
            <Field label="بیو"><Textarea {...form.register("bio")} /></Field>
            <Button type="submit" disabled={save.isPending}>ذخیره</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
