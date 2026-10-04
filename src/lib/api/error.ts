export function extractApiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.detail === "string" && record.detail.trim()) {
    return record.detail.trim();
  }
  if (Array.isArray(record.detail) && typeof record.detail[0] === "string") {
    return record.detail[0];
  }
  if (Array.isArray(record.non_field_errors) && typeof record.non_field_errors[0] === "string") {
    return record.non_field_errors[0];
  }

  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }

  return null;
}

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}
