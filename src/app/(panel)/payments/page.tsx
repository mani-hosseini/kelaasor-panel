"use client";

import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import PaymentsPageContent from "./PaymentsPageContent";

export default function PaymentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <PaymentsPageContent />
    </Suspense>
  );
}
