"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequirementGroup,
  deleteRequirementGroup,
  getRequirementGroup,
  getRequirementGroups,
  updateRequirementGroup,
} from "@/features/requirementGroups/api/requirementGroups.api";
import { requirementGroupKeys } from "@/features/requirementGroups/queries/requirementGroups.keys";
import type { RequirementGroupPayload } from "@/types/requirementGroup";


export function useRequirementGroups(projectId: string) {
  return useQuery({
    queryKey: requirementGroupKeys.lists(projectId),
    queryFn: () => getRequirementGroups(projectId),
  });
}

export function useRequirementGroup(projectId: string, groupId: string) {
  return useQuery({
    queryKey: requirementGroupKeys.detail(projectId, groupId),
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
      queryClient.invalidateQueries({ queryKey: requirementGroupKeys.lists(projectId) });
    },
  });
}

export function useUpdateRequirementGroup(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: RequirementGroupPayload;
    }) => updateRequirementGroup(projectId, groupId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requirementGroupKeys.detail(projectId, variables.groupId) });
      queryClient.invalidateQueries({ queryKey: requirementGroupKeys.lists(projectId) });
    },
  });
}

export function useDeleteRequirementGroup(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => deleteRequirementGroup(projectId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementGroupKeys.lists(projectId) });
    },
  });
}
