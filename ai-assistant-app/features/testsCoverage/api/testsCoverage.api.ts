import { apiClient } from "@/lib/api-client";
import type { TestsCoverage } from "@/types/testsCoverage";

type GetTestsCoverageParams = {
  projectId?: string;
  requirementId?: string;
};

export async function getTestsCoverage({
  projectId,
  requirementId,
}: GetTestsCoverageParams): Promise<TestsCoverage | null> {
  try {
    const response = await apiClient.get<TestsCoverage>(
      `/projects/${projectId}/requirements/${requirementId}/coverage`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tests coverage:", error);
    return null;
  }
}

export async function createTestsCoverage({
  projectId,
  requirementId,
}: GetTestsCoverageParams): Promise<TestsCoverage | null> {
  try {
    const response = await apiClient.post<TestsCoverage>(
      `/projects/${projectId}/requirements/${requirementId}/coverage`,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating tests coverage:", error);
    return null;
  }
}
