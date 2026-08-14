import type { ArtifactType, TestArtifactType } from "@/types/artifacts";

export const ARTIFACT_ORDER: ArtifactType[] = [
  "test_cases",
  "checklist",
  "negative_scenarios",
  "edge_cases",
  "automation_recommendations",
];

export const EXCLUDED_ARTIFACT_TYPES: ArtifactType[] = ["requirement_review"];

export const TEST_ARTIFACT_TYPES: TestArtifactType[] = [
  "test_cases",
  "checklist",
  "negative_scenarios",
];

export const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  test_cases: "Test Cases",
  checklist: "Checklist",
  negative_scenarios: "Negative Scenarios",
  edge_cases: "Edge Cases",
  requirement_review: "Requirement Review",
  automation_recommendations: "Automation Recommendations",
};

export const ARTIFACT_DESCRIPTIONS: Record<ArtifactType, string> = {
  test_cases: "Detailed test cases with steps and expected results.",
  checklist: "Key verification points and a quick testing checklist.",
  negative_scenarios: "Failure scenarios and error-condition testing.",
  edge_cases: "Boundary conditions and uncommon system paths.",
  requirement_review: "AI review of clarity, completeness, and quality.",
  automation_recommendations:
    "Recommendations for automation and tooling strategy.",
};

export function artifactLabel(type: ArtifactType) {
  return ARTIFACT_LABELS[type] ?? type;
}

export function artifactDescription(type: ArtifactType) {
  return ARTIFACT_DESCRIPTIONS[type] ?? "Generated artifact content.";
}

export function isTestArtifactType(
  artifactType: ArtifactType,
): artifactType is TestArtifactType {
  return TEST_ARTIFACT_TYPES.includes(artifactType as TestArtifactType);
}
