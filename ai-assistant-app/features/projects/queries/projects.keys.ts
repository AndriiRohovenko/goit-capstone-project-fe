export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (projectId: string) => [...projectKeys.all, "detail", projectId] as const,
  context: (projectId: string) =>
    [...projectKeys.all, "context", projectId] as const,
};
