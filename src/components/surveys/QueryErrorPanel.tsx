"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api/error";
import { clearSessionCookie } from "@/lib/auth";
import { routes } from "@/lib/routes";

export function QueryErrorPanel({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  // The local panel gate can outlive the API's auth cookie (e.g. it was
  // replaced by a student login on the same API host) — retrying won't help.
  const needsLogin =
    error instanceof ApiRequestError && (error.status === 401 || error.status === 403);

  return (
    <div className="surface-panel space-y-3 p-5 text-right">
      <p className="text-sm font-medium text-danger">
        {error instanceof Error && error.message ? error.message : "دریافت اطلاعات ممکن نشد."}
      </p>
      {needsLogin ? (
        <>
          <p className="text-xs text-muted-foreground">
            نشست ادمین شما در سرور معتبر نیست؛ دوباره وارد شوید.
          </p>
          <Button
            size="sm"
            onClick={() => {
              clearSessionCookie();
              router.replace(`${routes.login}?next=${encodeURIComponent(pathname)}`);
            }}
          >
            ورود دوباره
          </Button>
        </>
      ) : (
        <Button size="sm" variant="outline" onClick={onRetry}>
          تلاش مجدد
        </Button>
      )}
    </div>
  );
}
