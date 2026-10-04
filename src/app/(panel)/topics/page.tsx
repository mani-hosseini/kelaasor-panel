import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function TopicsRedirectPage() {
  redirect(routes.topics);
}
