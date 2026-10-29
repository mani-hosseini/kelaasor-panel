import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

/** Legacy route — certificates are issued from each bootcamp tab. */
export default function CertificatesRedirectPage() {
  redirect(routes.bootcamps);
}
