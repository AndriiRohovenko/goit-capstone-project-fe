export const artifactsKeys = {
  all: ["artifacts"] as const,
  lists: (projectId?: string, requirementId?: string) =>
    [
      ...artifactsKeys.all,
      "list",
      ...(projectId ? [projectId] : []),
      ...(requirementId ? [requirementId] : []),
    ] as const,
  detail: (projectId: string, requirementId: string, artifactType: string) =>
    [
      ...artifactsKeys.all,
      "detail",
      projectId,
      requirementId,
      artifactType,
    ] as const,
};
