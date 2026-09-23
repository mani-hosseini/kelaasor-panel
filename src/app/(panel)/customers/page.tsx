"use client";

import { Suspense } from "react";

import { CustomersPageContent } from "./CustomersPageContent";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <CustomersPageContent />
    </Suspense>
  );
}
