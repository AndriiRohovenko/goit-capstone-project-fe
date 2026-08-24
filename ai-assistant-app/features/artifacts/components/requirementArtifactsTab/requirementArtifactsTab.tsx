"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { useIsMutating } from "@tanstack/react-query";
import {
  ARTIFACT_GENERATE_MUTATION_KEY,
  useArtifacts,
  useCreateArtifact,
} from "@/features/artifacts/queries/artifacts.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ArtifactType } from "@/types/artifacts";
import { ArtifactEditorModal } from "./ArtifactEditorModal";
import { ArtifactList } from "./ArtifactList";
import {
  ARTIFACT_ORDER,
  EXCLUDED_ARTIFACT_TYPES,
  isTestArtifactType,
} from "./artifactTab.constants";
import type { RequirementArtifactsTabProps } from "./artifactTab.types";
import styles from "./requirementArtifactsTab.module.scss";

export function RequirementArtifactsTab({
  projectId,
  requirementId,
}: RequirementArtifactsTabProps) {
  const [selectedArtifactType, setSelectedArtifactType] =
    useState<ArtifactType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const artifacts = useArtifacts(projectId, requirementId);
  const createArtifact = useCreateArtifact();
  const activeGenerateMutations = useIsMutating({
    mutationKey: ARTIFACT_GENERATE_MUTATION_KEY,
  });

  const sortedArtifacts = useMemo(() => {
    const list = (artifacts.data ?? []).filter(
      (artifact) => !EXCLUDED_ARTIFACT_TYPES.includes(artifact.artifact_type),
    );

    return [...list].sort((a, b) => {
      const left = ARTIFACT_ORDER.indexOf(a.artifact_type);
      const right = ARTIFACT_ORDER.indexOf(b.artifact_type);

      if (left === -1 || right === -1) {
        return a.artifact_type.localeCompare(b.artifact_type);
      }

      return left - right;
    });
  }, [artifacts.data]);

  const selectedArtifact = useMemo(
    () =>
      selectedArtifactType
        ? sortedArtifacts.find(
            (artifact) => artifact.artifact_type === selectedArtifactType,
          )
        : null,
    [selectedArtifactType, sortedArtifacts],
  );

  const hasGeneratedTestArtifacts = useMemo(
    () =>
      (artifacts.data ?? []).some((artifact) =>
        isTestArtifactType(artifact.artifact_type),
      ),
    [artifacts.data],
  );

  const isMutating = createArtifact.isPending;
  const isGeneratingArtifactsRequest = activeGenerateMutations > 0;

  function openArtifact(artifactType: ArtifactType) {
    setSelectedArtifactType(artifactType);
  }

  function closeModal() {
    setSelectedArtifactType(null);
  }

  async function handleGenerateOrRegenerateArtifacts() {
    setActionError(null);

    try {
      await createArtifact.mutateAsync({
        projectId,
        requirementId,
        payload: { generation_type: "test_generation" },
      });
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to generate test artifacts."),
      );
    }
  }

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Test Artifacts</h3>
          <Button
            type="button"
            variant="secondary"
            className={styles.headerActionButton}
            onClick={() => void handleGenerateOrRegenerateArtifacts()}
            disabled={isMutating || artifacts.isPending}
          >
            <Sparkles size={14} strokeWidth={2.1} />
            {createArtifact.isPending
              ? "Generating..."
              : hasGeneratedTestArtifacts
                ? "Regenerate All"
                : "Generate All"}
          </Button>
        </div>
        <p className={styles.subtitle}>
          AI-generated artifacts to help validate and test this requirement.
        </p>

        <div
          className={`${styles.contentRegion}${isGeneratingArtifactsRequest ? ` ${styles.contentRegionBusy}` : ""}`}
        >
          {artifacts.isPending ? (
            <p className={styles.empty}>Loading artifacts...</p>
          ) : sortedArtifacts.length ? (
            <ArtifactList artifacts={sortedArtifacts} onOpen={openArtifact} />
          ) : (
            <p className={styles.empty}>
              No artifacts generated yet. Use the generator in AI Requirement
              Analysis.
            </p>
          )}

          {isGeneratingArtifactsRequest ? (
            <div className={styles.overlay} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              <span className={styles.overlayText}>
                Generating artifacts...
              </span>
            </div>
          ) : null}
        </div>

        {actionError ? <p className={styles.error}>{actionError}</p> : null}
      </div>

      <ArtifactEditorModal
        key={selectedArtifact?.id ?? selectedArtifactType ?? "artifact-modal"}
        open={Boolean(selectedArtifact)}
        artifact={selectedArtifact ?? null}
        projectId={projectId}
        requirementId={requirementId}
        onClose={closeModal}
      />
    </>
  );
}
