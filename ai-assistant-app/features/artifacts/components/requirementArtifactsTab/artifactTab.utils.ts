import type { ArtifactType } from "@/types/artifacts";
import type {
  ArtifactDraft,
  ScenarioItem,
  TestCaseItem,
} from "./artifactTab.types";

export function createDraft(
  artifactType: ArtifactType,
  content: unknown,
): ArtifactDraft {
  return {
    testCases: artifactType === "test_cases" ? toTestCases(content) : [],
    checklist: artifactType === "checklist" ? toChecklist(content) : [],
    scenarios:
      artifactType === "negative_scenarios" || artifactType === "edge_cases"
        ? toScenarios(content)
        : [],
    recommendations:
      artifactType === "automation_recommendations" ? toChecklist(content) : [],
  };
}

export function serializeDraft(
  artifactType: ArtifactType,
  draft: ArtifactDraft,
): unknown {
  if (artifactType === "test_cases") {
    return draft.testCases
      .map((item) => ({
        title: item.title.trim(),
        priority: item.priority.trim(),
        steps: item.steps.map((step) => step.trim()).filter(Boolean),
        expected_result: item.expectedResult.trim(),
      }))
      .filter(
        (item) => item.title || item.expected_result || item.steps.length > 0,
      );
  }

  if (artifactType === "checklist") {
    return draft.checklist.map((item) => item.trim()).filter(Boolean);
  }

  if (artifactType === "negative_scenarios" || artifactType === "edge_cases") {
    return draft.scenarios
      .map((item) => ({
        title: item.title.trim(),
        expected_result: item.expectedResult.trim(),
      }))
      .filter((item) => item.title);
  }

  if (artifactType === "automation_recommendations") {
    return draft.recommendations.map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export function toTestCases(content: unknown): TestCaseItem[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = stringValue(record.title);

      if (!title) {
        return null;
      }

      return {
        title,
        priority: stringValue(record.priority),
        steps: stringList(record.steps),
        expectedResult:
          stringValue(record.expected_result) ||
          stringValue(record.expectedResult),
      };
    })
    .filter((item): item is TestCaseItem => Boolean(item));
}

export function toChecklist(content: unknown): string[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function toScenarios(content: unknown): ScenarioItem[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = stringValue(record.title);

      if (!title) {
        return null;
      }

      return {
        title,
        expectedResult:
          stringValue(record.expected_result) ||
          stringValue(record.expectedResult),
      };
    })
    .filter((item): item is ScenarioItem => Boolean(item));
}

export function contentSummary(content: unknown) {
  if (Array.isArray(content)) {
    return `${content.length} item${content.length === 1 ? "" : "s"}`;
  }

  if (content && typeof content === "object") {
    const fields = Object.keys(content).length;
    return `${fields} field${fields === 1 ? "" : "s"}`;
  }

  if (typeof content === "string") {
    return content.trim() ? "Text" : "Empty";
  }

  return "Unknown";
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toPrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function capitalize(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}
