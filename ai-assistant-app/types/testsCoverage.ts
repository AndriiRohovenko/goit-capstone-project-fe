export type TestsCoverage = {
  id: string;
  projectId: string;
  requirementId: string;
  content: unknown;
  coverage_score: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
  updated_at: string;
};
