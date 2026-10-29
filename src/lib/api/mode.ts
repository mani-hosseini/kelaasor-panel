/**
 * When `NEXT_PUBLIC_USE_MOCK=true`, `adminApi` serves seed data from `mockStore`
 * instead of calling the live Django panel APIs.
 */
export function isMockMode() {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}
