import { BootcampHubNav } from "@/components/bootcamps/BootcampHubNav";

export default function BootcampsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <BootcampHubNav />
      {children}
    </div>
  );
}
