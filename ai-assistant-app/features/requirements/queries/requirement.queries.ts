"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { isAxiosError } from "axios";
import {
  getRequirementGroups,
    getRequirementGroup,
    createRequirementGroup,
    updateRequirementGroup,
    deleteRequirementGroup
} from "@/features/requirementGroups/api/requirementGroups.api";
import { requirementKeys } from "@/features/requirements/queries/requirement.keys";
import type {
  RequirementGroupPayload,
} from "@/types/requirementGroup";

export function useRequirementGroups(projectId: string) {
  return useQuery({
    queryKey: requirementKeys.lists(),
    queryFn: () => getRequirementGroups(projectId),
  });
}

export function useRequirementGroup(projectId: string, groupId: string) {
  return useQuery({
    queryKey: requirementKeys.detail(groupId),
    queryFn: () => getRequirementGroup(projectId, groupId),
    enabled: Boolean(groupId),
  });
}

export function useCreateRequirementGroup(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequirementGroupPayload) =>
      createRequirementGroup(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
}

export function useUpdateRequirementGroup(projectId: string, groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequirementGroupPayload) =>
      updateRequirementGroup(projectId, groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
}

export function useDeleteRequirementGroup(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => deleteRequirementGroup(projectId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
}
