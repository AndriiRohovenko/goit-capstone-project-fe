"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTestsCoverage,
  getTestsCoverage,
} from "@/features/testsCoverage/api/testsCoverage.api";
import { testsCoverageKeys } from "@/features/testsCoverage/queries/testsCoverage.keys";
import type { TestsCoverage } from "@/types/testsCoverage";

export const TESTS_COVERAGE_CREATE_MUTATION_KEY = [
  "testsCoverage",
  "create",
] as const;

export function useTestsCoverage(projectId: string, requirementId: string) {
  return useQuery<TestsCoverage | null>({
    queryKey: testsCoverageKeys.detail(projectId, requirementId),
    queryFn: () => getTestsCoverage({ projectId, requirementId }),
    enabled: Boolean(projectId) && Boolean(requirementId),
  });
}

export function useCreateTestsCoverage() {
  const queryClient = useQueryClient();

  return useMutation<
    TestsCoverage | null,
    Error,
    { projectId: string; requirementId: string }
  >({
    mutationKey: TESTS_COVERAGE_CREATE_MUTATION_KEY,
    mutationFn: ({ projectId, requirementId }) =>
      createTestsCoverage({ projectId, requirementId }),
    onSuccess: (_data, { projectId, requirementId }) => {
      void queryClient.invalidateQueries({
        queryKey: testsCoverageKeys.detail(projectId, requirementId),
      });
      void queryClient.invalidateQueries({ queryKey: testsCoverageKeys.all });
    },
  });
}
