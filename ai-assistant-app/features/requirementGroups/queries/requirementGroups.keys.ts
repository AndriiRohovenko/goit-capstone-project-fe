export const requirementGroupKeys = {
  all: ["requirement-groups"] as const,
  lists: (projectId: string) => [...requirementGroupKeys.all, projectId, "list"] as const,
  detail: (projectId: string, groupId: string) => [...requirementGroupKeys.all, projectId, "detail", groupId] as const,
};
