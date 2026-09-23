import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default async function UserRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(routes.customer(id));
}
