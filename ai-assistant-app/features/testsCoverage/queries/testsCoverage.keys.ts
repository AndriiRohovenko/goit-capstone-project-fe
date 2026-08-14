export const testsCoverageKeys = {
  all: ["testsCoverage"] as const,
  lists: (projectId: string, requirementId: string) =>
    [...testsCoverageKeys.all, "list", projectId, requirementId] as const,
  detail: (projectId: string, requirementId: string) =>
    [...testsCoverageKeys.lists(projectId, requirementId), "detail"] as const,
};
