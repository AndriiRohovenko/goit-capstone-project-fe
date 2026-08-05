export const requirementKeys = {
  all: ["requirements"] as const,
  lists: (projectId: string) => [...requirementKeys.all, projectId, "list"] as const,
  detail: (projectId: string, requirementId: string) => [...requirementKeys.all, projectId, "detail", requirementId] as const,
};
