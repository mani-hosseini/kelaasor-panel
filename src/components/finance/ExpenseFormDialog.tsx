"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBootcamps, useCreateExpense, useUpdateExpense } from "@/lib/api/queries";
import {
  EXPENSE_CATEGORY,
  expenseCategoryMeta,
  type Expense,
  type ExpenseCategory,
  type ExpenseInput,
} from "@/lib/api/types";
import { formatToman } from "@/lib/format";

const CATEGORIES = Object.values(EXPENSE_CATEGORY);
const DELIVERIES: Expense["delivery"][] = ["shared", "online", "in_person"];

const deliveryLabel: Record<Expense["delivery"], string> = {
  shared: "مشترک",
  online: "آنلاین",
  in_person: "حضوری",
};

type FormState = {
  title: string;
  category: ExpenseCategory;
  amount: string;
  season: string;
  bootcampId: string;
  delivery: Expense["delivery"];
  spentAt: string;
  note: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    category: EXPENSE_CATEGORY.OPERATIONS,
    amount: "",
    season: "",
    bootcampId: "",
    delivery: "shared",
    spentAt: new Date().toISOString().slice(0, 10),
    note: "",
  };
}

function fromExpense(expense: Expense): FormState {
  return {
    title: expense.title,
    category: expense.category,
    amount: String(expense.amount),
    season: expense.season ?? "",
    bootcampId: expense.bootcampId != null ? String(expense.bootcampId) : "",
    delivery: expense.delivery,
    spentAt: expense.spentAt.slice(0, 10),
    note: expense.note ?? "",
  };
}

function toInput(form: FormState): ExpenseInput {
  return {
    title: form.title.trim(),
    category: form.category,
    amount: Math.max(0, Math.round(Number(form.amount) || 0)),
    season: form.season.trim() || null,
    bootcampId: form.bootcampId ? Number(form.bootcampId) : null,
    delivery: form.delivery,
    spentAt: form.spentAt,
    note: form.note.trim(),
  };
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}) {
  const bootcampsQuery = useBootcamps();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const [form, setForm] = useState<FormState>(emptyForm);
  const editing = Boolean(expense);

  useEffect(() => {
    if (!open) return;
    setForm(expense ? fromExpense(expense) : emptyForm());
  }, [open, expense]);

  const pending = createExpense.isPending || updateExpense.isPending;
  const previewAmount = Number(form.amount) || 0;

  function submit() {
    if (!form.title.trim()) {
      toast.error("عنوان هزینه الزامی است");
      return;
    }
    if (!form.spentAt) {
      toast.error("تاریخ هزینه الزامی است");
      return;
    }
    if (previewAmount <= 0) {
      toast.error("مبلغ باید بیشتر از صفر باشد");
      return;
    }

    const input = toInput(form);
    if (expense) {
      updateExpense.mutate(
        { id: expense.id, data: input },
        {
          onSuccess: () => {
            toast.success("هزینه به‌روز شد");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
      return;
    }

    createExpense.mutate(input, {
      onSuccess: () => {
        toast.success("هزینه ثبت شد");
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing ? "ویرایش هزینه" : "ثبت هزینه جدید"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-right">
          <div className="space-y-1.5">
            <Label htmlFor="expense-title">عنوان</Label>
            <Input
              id="expense-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="مثلاً اجاره فضای حضوری پاییز"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>دسته‌بندی</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value as ExpenseCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {expenseCategoryMeta[category].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>نحوه برگزاری</Label>
              <Select
                value={form.delivery}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    delivery: value as Expense["delivery"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERIES.map((delivery) => (
                    <SelectItem key={delivery} value={delivery}>
                      {deliveryLabel[delivery]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">مبلغ (تومان)</Label>
              <Input
                id="expense-amount"
                dir="ltr"
                inputMode="numeric"
                className="text-left"
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    amount: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                placeholder="1000000"
              />
              {previewAmount > 0 ? (
                <p className="text-[11px] text-muted-foreground">{formatToman(previewAmount)}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-spent-at">تاریخ</Label>
              <Input
                id="expense-spent-at"
                type="date"
                dir="ltr"
                className="text-left"
                value={form.spentAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, spentAt: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="expense-season">فصل (اختیاری)</Label>
              <Input
                id="expense-season"
                value={form.season}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, season: event.target.value }))
                }
                placeholder="پاییز ۱۴۰۴"
              />
            </div>

            <div className="space-y-1.5">
              <Label>بوت‌کمپ (اختیاری)</Label>
              <Select
                value={form.bootcampId || "none"}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    bootcampId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="بدون بوت‌کمپ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون بوت‌کمپ</SelectItem>
                  {(bootcampsQuery.data ?? []).map((bootcamp) => (
                    <SelectItem key={bootcamp.id} value={String(bootcamp.id)}>
                      {bootcamp.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-note">یادداشت</Label>
            <Textarea
              id="expense-note"
              rows={2}
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="اختیاری"
            />
          </div>

          <div className="flex justify-start gap-2 pt-1">
            <Button onClick={submit} disabled={pending}>
              {editing ? "ذخیره تغییرات" : "ثبت هزینه"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              انصراف
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
