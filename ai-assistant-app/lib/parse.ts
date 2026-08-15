/** Helpers for reading AI-generated payloads, whose shape is not guaranteed. */

export type ParsedAiContentSection = {
  key: string;
  title: string;
  value: unknown;
};

export function toRecord(value: unknown): Record<string, unknown> | null {
  if (!isPlainObject(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function parseAiContentSections(
  value: unknown,
): ParsedAiContentSection[] {
  const record = toRecord(value);

  if (!record) {
    return [];
  }

  return Object.entries(record).map(([key, sectionValue]) => ({
    key,
    title: humanizeKey(key),
    value: sectionValue,
  }));
}

export function formatAiContentValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (typeof value === "string") {
    return value.trim() || "N/A";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2) ?? "N/A";
  } catch {
    return String(value);
  }
}

export function humanizeKey(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getBestObjectLabel(value: unknown, fallback: string): string {
  const record = toRecord(value);

  if (!record) {
    return fallback;
  }

  const preferredKeys = [
    "title",
    "name",
    "area",
    "scenario",
    "recommendation",
    "text",
    "summary",
    "artifact_type",
  ];

  for (const key of preferredKeys) {
    const candidate = formatAiContentValue(record[key]);

    if (candidate !== "N/A") {
      return candidate;
    }
  }

  return fallback;
}

export function hasRenderableContent(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (isPlainObject(value)) {
    return Object.keys(value).length > 0;
  }

  return true;
}
