import { apiClient } from "@/lib/api-client";
import type {Requirement, RequirementPayload} from "@/types/requirement";

export async function getRequirements(projectId: string, groupId?: string): Promise<Requirement[]> {
  const query = groupId ? `?group_id=${groupId}` : "";
  const response = await apiClient.get(`/projects/${projectId}/requirements${query}`);
  return response.data;
}

export async function getRequirement(projectId: string, requirementId: string): Promise<Requirement> {
  const response = await apiClient.get(`/projects/${projectId}/requirements/${requirementId}`);
  return response.data;
}

export async function createRequirement(projectId: string, payload: RequirementPayload): Promise<Requirement> {
  const response = await apiClient.post(`/projects/${projectId}/requirements`, payload);
  return response.data;
}

export async function updateRequirement(projectId: string, requirementId: string, payload: RequirementPayload): Promise<Requirement> {
  const response = await apiClient.put(`/projects/${projectId}/requirements/${requirementId}`, payload);
  return response.data;
}

export async function deleteRequirement(projectId: string, requirementId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/requirements/${requirementId}`);
}
