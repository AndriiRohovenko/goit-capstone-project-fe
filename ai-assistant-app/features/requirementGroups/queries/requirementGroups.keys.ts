export const requirementGroupKeys = {
  all: ["requirement-groups"] as const,
  lists: () => [...requirementGroupKeys.all, "list"] as const,
  detail: (groupId: string) => [...requirementGroupKeys.all, "detail", groupId] as const,
};
