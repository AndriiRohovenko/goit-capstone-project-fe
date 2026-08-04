export const requirementKeys = {
  all: ["requirements"] as const,
  lists: () => [...requirementKeys.all, "list"] as const,
  detail: (requirementId: string) => [...requirementKeys.all, "detail", requirementId] as const,
};
