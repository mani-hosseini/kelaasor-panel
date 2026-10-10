import { Label } from "@/components/ui/label";

export function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "space-y-2"}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
