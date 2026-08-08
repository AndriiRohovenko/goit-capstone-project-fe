import { apiClient } from "@/lib/api-client";
import type { PaginatedRequirements, Requirement, RequirementPayload } from "@/types/requirement";

type GetRequirementsParams = {
  groupId?: string;
  page?: number;
  limit?: number;
};

export async function getRequirements(
  projectId: string,
  params?: GetRequirementsParams,
): Promise<PaginatedRequirements> {
  const searchParams = new URLSearchParams();
  if (params?.groupId) searchParams.set("group_id", params.groupId);
  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("limit", String(params?.limit ?? 20));
  const response = await apiClient.get(
    `/projects/${projectId}/requirements?${searchParams.toString()}`,
  );
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
