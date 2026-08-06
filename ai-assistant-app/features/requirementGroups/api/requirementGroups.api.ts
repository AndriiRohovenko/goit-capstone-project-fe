import { apiClient } from "@/lib/api-client";
import type { RequirementGroup, RequirementGroupPayload } from "@/types/requirementGroup";

export async function getRequirementGroups(projectId: string): Promise<RequirementGroup[]> {
  const response = await apiClient.get(`/projects/${projectId}/requirement-groups`);
  return response.data;
}

export async function getRequirementGroup(projectId: string, groupId: string): Promise<RequirementGroup> {
  const response = await apiClient.get(`/projects/${projectId}/requirement-groups/${groupId}`);
  return response.data;
}

export async function createRequirementGroup(projectId: string, payload: RequirementGroupPayload): Promise<RequirementGroup> {
  const response = await apiClient.post(`/projects/${projectId}/requirement-groups`, payload);
  return response.data;
}

export async function updateRequirementGroup(projectId: string, groupId: string, payload: RequirementGroupPayload): Promise<RequirementGroup> {
  const response = await apiClient.put(`/projects/${projectId}/requirement-groups/${groupId}`, payload);
  return response.data;
}

export async function deleteRequirementGroup(projectId: string, groupId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/requirement-groups/${groupId}`);
}