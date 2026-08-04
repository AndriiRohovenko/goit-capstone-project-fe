import { apiClient } from "@/lib/api-client";
import type {
  CreateProjectPayload,
  Project,
  ProjectContext,
  UpdateProjectPayload,
  UpdateProjectContextPayload,
} from "@/types/project";

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

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.put<Project>(
    `/projects/${projectId}`,
    payload,
  );
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}

export async function getProjectContext(
  projectId: string,
): Promise<ProjectContext> {
  const { data } = await apiClient.get<ProjectContext>(
    `/projects/${projectId}/context`,
  );
  return data;
}

export async function updateProjectContext(
  projectId: string,
  payload: UpdateProjectContextPayload,
): Promise<ProjectContext> {
  const { data } = await apiClient.put<ProjectContext>(
    `/projects/${projectId}/context`,
    payload,
  );
  return data;
}
