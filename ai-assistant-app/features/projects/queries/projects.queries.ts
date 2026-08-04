"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  createProject,
  deleteProject,
  getProject,
  getProjectContext,
  getProjects,
  updateProject,
  updateProjectContext,
} from "@/features/projects/api/projects.api";
import { projectKeys } from "@/features/projects/queries/projects.keys";
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
  UpdateProjectContextPayload,
} from "@/types/project";

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: getProjects,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectContext(projectId: string) {
  return useQuery({
    queryKey: projectKeys.context(projectId),
    queryFn: () => getProjectContext(projectId),
    enabled: Boolean(projectId),
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: UpdateProjectPayload;
    }) => updateProject(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProjectContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: UpdateProjectContextPayload;
    }) => updateProjectContext(projectId, payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.context(projectId),
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
