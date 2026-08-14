"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArtifactsByGenerationType,
  getAllArtifacts,
  getArtifactByType,
  regenerateArtifactByType,
  updateArtifact,
} from "@/features/artifacts/api/artifacts.api";
import { artifactsKeys } from "@/features/artifacts/queries/artifacts.keys";
import type {
  Artifact,
  ArtifactType,
  CreateArtifactRequest,
  UpdateArtifactRequest,
} from "@/types/artifacts";

export const ARTIFACT_GENERATE_MUTATION_KEY = [
  "artifacts",
  "generate",
] as const;

export function useArtifacts(projectId: string, requirementId: string) {
  return useQuery<Artifact[]>({
    queryKey: artifactsKeys.lists(projectId, requirementId),
    queryFn: () => getAllArtifacts(projectId, requirementId),
    enabled: Boolean(projectId) && Boolean(requirementId),
  });
}

export function useArtifact(
  projectId: string,
  requirementId: string,
  artifactType: ArtifactType,
) {
  return useQuery<Artifact>({
    queryKey: artifactsKeys.detail(projectId, requirementId, artifactType),
    queryFn: () => getArtifactByType(projectId, requirementId, artifactType),
    enabled:
      Boolean(projectId) && Boolean(requirementId) && Boolean(artifactType),
  });
}

export function useCreateArtifact() {
  const queryClient = useQueryClient();

  return useMutation<
    Artifact,
    Error,
    {
      projectId: string;
      requirementId: string;
      payload: CreateArtifactRequest;
    }
  >({
    mutationKey: ARTIFACT_GENERATE_MUTATION_KEY,
    mutationFn: ({ projectId, requirementId, payload }) =>
      createArtifactsByGenerationType(projectId, requirementId, payload),
    onSuccess: (_data, { projectId, requirementId }) => {
      void queryClient.invalidateQueries({
        queryKey: artifactsKeys.lists(projectId, requirementId),
      });
      void queryClient.invalidateQueries({ queryKey: artifactsKeys.all });
    },
  });
}

export function useUpdateArtifact() {
  const queryClient = useQueryClient();

  return useMutation<
    Artifact,
    Error,
    {
      projectId: string;
      requirementId: string;
      artifactType: ArtifactType;
      payload: UpdateArtifactRequest;
    }
  >({
    mutationFn: ({ projectId, requirementId, artifactType, payload }) =>
      updateArtifact(projectId, requirementId, artifactType, payload),
    onSuccess: (_data, { projectId, requirementId, artifactType }) => {
      void queryClient.invalidateQueries({
        queryKey: artifactsKeys.detail(projectId, requirementId, artifactType),
      });
      void queryClient.invalidateQueries({
        queryKey: artifactsKeys.lists(projectId, requirementId),
      });
    },
  });
}

export function useRegenerateArtifact() {
  const queryClient = useQueryClient();

  return useMutation<
    Artifact,
    Error,
    {
      projectId: string;
      requirementId: string;
      artifactType: ArtifactType;
    }
  >({
    mutationFn: ({ projectId, requirementId, artifactType }) =>
      regenerateArtifactByType(projectId, requirementId, artifactType),
    onSuccess: (_data, { projectId, requirementId, artifactType }) => {
      void queryClient.invalidateQueries({
        queryKey: artifactsKeys.detail(projectId, requirementId, artifactType),
      });
      void queryClient.invalidateQueries({
        queryKey: artifactsKeys.lists(projectId, requirementId),
      });
    },
  });
}
