export type Artifact = {
  id: string;
  requirement_id: string;
  artifact_type: ArtifactType;
  content: unknown;
  is_edited: boolean;
  model: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
  updated_at: string;
};

export type GenerationType =
  | "requirement_review"
  | "test_generation"
  | "coverage_analysis"
  | "automation_recommendation";

export type ArtifactType =
  | "test_cases"
  | "checklist"
  | "negative_scenarios"
  | "edge_cases"
  | "requirement_review"
  | "automation_recommendations";

export type TestArtifactType =
  "test_cases" | "checklist" | "negative_scenarios";

export type CreateArtifactRequest = {
  generation_type: GenerationType;
};

export type UpdateArtifactRequest = {
  content: unknown;
};
