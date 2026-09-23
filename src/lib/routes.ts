export const routes = {
  login: "/login",
  root: "/",
  enrollments: "/enrollments",
  enrollment: (id: number | string) => `/enrollments/${id}`,
  payments: "/payments",
  payment: (id: number | string) => `/payments/${id}`,
  bootcamps: "/bootcamps",
  bootcampNew: "/bootcamps/new",
  bootcamp: (id: number | string) => `/bootcamps/${id}`,
  bootcampEdit: (id: number | string) => `/bootcamps/${id}/edit`,
  customers: "/customers",
  customer: (id: number | string) => `/customers/${id}`,
  /** @deprecated use customers */
  users: "/customers",
  /** @deprecated use customer */
  user: (id: number | string) => `/customers/${id}`,
  instructors: "/instructors",
  instructor: (id: number | string) => `/instructors/${id}`,
  blog: "/blog",
  blogPost: (id: number | string) => `/blog/${id}`,
  topics: "/topics",
  sponsors: "/sponsors",
} as const;

export function isNavActive(pathname: string, href: string) {
  if (href === routes.root) return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
