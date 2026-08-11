import type { ArtifactType } from "@/types/artifacts";

export type RequirementArtifactsTabProps = {
  projectId: string;
  requirementId: string;
};

export type TestCaseItem = {
  title: string;
  priority: string;
  steps: string[];
  expectedResult: string;
};

export type ScenarioItem = {
  title: string;
  expectedResult: string;
};

export type ArtifactDraft = {
  testCases: TestCaseItem[];
  checklist: string[];
  scenarios: ScenarioItem[];
  recommendations: string[];
};

export type ArtifactEditorProps = {
  artifactType: ArtifactType;
  draft: ArtifactDraft | null;
  disabled: boolean;
  onDraftChange: (next: ArtifactDraft | null) => void;
};
