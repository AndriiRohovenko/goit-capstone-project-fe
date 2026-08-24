export const requirementKeys = {
  all: ["requirements"] as const,
  list: (projectId: string) => [...requirementKeys.all, projectId, "list"] as const,
  lists: (projectId: string, params?: { groupId?: string; page?: number; limit?: number }) =>
    (params
      ? [...requirementKeys.list(projectId), params] as const
      : requirementKeys.list(projectId)),
  detail: (projectId: string, requirementId: string) =>
    [...requirementKeys.all, projectId, "detail", requirementId] as const,
};
