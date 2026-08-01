import { isAxiosError } from "axios";

type FastApiValidationIssue = {
  msg?: string;
  type?: string;
  loc?: Array<string | number>;
};

function formatDetail(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as FastApiValidationIssue).msg);
        }
        return null;
      })
      .filter((message): message is string => Boolean(message));

    return messages.length ? messages.join(". ") : null;
  }

  if (detail && typeof detail === "object" && "msg" in detail) {
    return String((detail as FastApiValidationIssue).msg);
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as
    | { detail?: unknown; message?: string }
    | undefined;

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return formatDetail(data?.detail) ?? fallback;
}
