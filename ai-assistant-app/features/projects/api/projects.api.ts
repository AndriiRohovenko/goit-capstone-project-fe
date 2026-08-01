import { apiClient } from "@/lib/api-client";
import type { CreateProjectPayload, Project } from "@/types/project";

export async function getProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>("/projects");
  return data;
}

export async function getProject(projectId: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${projectId}`);
  return data;
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<Project>("/projects", payload);
  return data;
}
