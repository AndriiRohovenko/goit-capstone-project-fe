export const requirementKeys = {
  all: ["requirements"] as const,
  lists: (projectId: string, params?: { groupId?: string; page?: number; limit?: number }) =>
    [...requirementKeys.all, projectId, "list", params] as const,
  detail: (projectId: string, requirementId: string) =>
    [...requirementKeys.all, projectId, "detail", requirementId] as const,
};
