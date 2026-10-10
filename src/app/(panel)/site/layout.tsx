import { SitePagesNav } from "@/components/site/SitePagesNav";

export default function SitePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <SitePagesNav />
      {children}
    </div>
  );
}
