"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequirement,
  deleteRequirement,
  getRequirement,
  getRequirements,
  updateRequirement,
} from "@/features/requirements/api/requirements.api";
import { requirementKeys } from "@/features/requirements/queries/requirement.keys";
import type { RequirementPayload } from "@/types/requirement";

export function useRequirements(projectId: string, groupId?: string) {
  return useQuery({
    queryKey: requirementKeys.lists(projectId),
    queryFn: () => getRequirements(projectId, groupId),
  });
}

export function useRequirement(projectId: string, requirementId: string) {
  return useQuery({
    queryKey: requirementKeys.detail(projectId, requirementId),
    queryFn: () => getRequirement(projectId, requirementId),
    enabled: Boolean(requirementId),
  });
}

export function useCreateRequirement(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequirementPayload) => createRequirement(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists(projectId) });
    },
  });
}

export function useUpdateRequirement(projectId: string, requirementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequirementPayload) => updateRequirement(projectId, requirementId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(projectId, requirementId) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists(projectId) });
    },
  });
}

export function useDeleteRequirement(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requirementId: string) => deleteRequirement(projectId, requirementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists(projectId) });
    },
  });
}
