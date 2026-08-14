import { apiClient } from "@/lib/api-client";
import type {
  Artifact,
  ArtifactType,
  CreateArtifactRequest,
  UpdateArtifactRequest,
} from "@/types/artifacts";

export async function createArtifactsByGenerationType(
  projectId: string,
  requirementId: string,
  generationTypePayload: CreateArtifactRequest,
): Promise<Artifact> {
  const { data } = await apiClient.post<Artifact>(
    `/projects/${projectId}/requirements/${requirementId}/artifacts/generate`,
    generationTypePayload,
  );
  return data;
}

export async function updateArtifact(
  projectId: string,
  requirementId: string,
  artifactType: ArtifactType,
  payload: UpdateArtifactRequest,
): Promise<Artifact> {
  const { data } = await apiClient.patch<Artifact>(
    `/projects/${projectId}/requirements/${requirementId}/artifacts/${artifactType}`,
    payload,
  );
  return data;
}

export async function getAllArtifacts(
  projectId: string,
  requirementId: string,
): Promise<Artifact[]> {
  const { data } = await apiClient.get<Artifact[]>(
    `/projects/${projectId}/requirements/${requirementId}/artifacts`,
  );
  return data;
}

export async function getArtifactByType(
  projectId: string,
  requirementId: string,
  artifactType: ArtifactType,
): Promise<Artifact> {
  const { data } = await apiClient.get<Artifact>(
    `/projects/${projectId}/requirements/${requirementId}/artifacts/${artifactType}`,
  );
  return data;
}

export async function regenerateArtifactByType(
  projectId: string,
  requirementId: string,
  artifactType: ArtifactType,
): Promise<Artifact> {
  const { data } = await apiClient.post<Artifact>(
    `/projects/${projectId}/requirements/${requirementId}/artifacts/${artifactType}/regenerate`,
  );
  return data;
}
