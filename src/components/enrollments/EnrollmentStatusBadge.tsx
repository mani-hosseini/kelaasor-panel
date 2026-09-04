import { Badge } from "@/components/ui/badge";
import { enrollmentStatusMeta } from "@/lib/api/mock/seed";

export function EnrollmentStatusBadge({ status }: { status: number }) {
  const meta = enrollmentStatusMeta[status] ?? { label: "نامشخص", tone: "neutral" as const };
  const variant =
    meta.tone === "success"
      ? "success"
      : meta.tone === "warning"
        ? "warning"
        : meta.tone === "danger"
          ? "danger"
          : meta.tone === "info"
            ? "info"
            : "secondary";
  return <Badge variant={variant}>{meta.label}</Badge>;
}
