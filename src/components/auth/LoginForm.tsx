"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api/client";
import { DEMO_EMAIL, DEMO_PASSWORD, setSessionCookie } from "@/lib/auth";
import { routes } from "@/lib/routes";

const schema = z.object({
  email: z.string().trim().email("ایمیل معتبر وارد کنید."),
  password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد."),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: DEMO_EMAIL, password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await adminApi.auth.login(values);
      setSessionCookie();
      toast.success("خوش آمدید");
      router.replace(search.get("next") || routes.root);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "ورود ناموفق بود.");
    }
  });

  return (
    <div className="login-atmosphere flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_80px_-40px_rgba(8,37,33,0.45)]">
        <div className="h-1.5 brand-gradient" />
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <BrandLogo size={56} className="rounded-2xl shadow-lift" priority />
            <p className="mt-4 text-sm font-bold text-brand">کلاسور</p>
            <h1 className="mt-1 text-xl font-bold">ورود مدیر سیستم</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              کنترل‌پنل ثبت‌نام، پرداخت و بوت‌کمپ‌های کلاسور
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">ایمیل</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                dir="ltr"
                className="text-left"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">رمز عبور</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  className="pe-10 text-left"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-2 inline-flex items-center text-muted-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            {formError ? (
              <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ورود…
                </>
              ) : (
                "ورود به پنل ادمین"
              )}
            </Button>
          </form>
          <p className="rounded-xl bg-muted px-3 py-2 text-center text-[11px] text-muted-foreground" dir="ltr">
            {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </div>
      </div>
    </div>
  );
}
