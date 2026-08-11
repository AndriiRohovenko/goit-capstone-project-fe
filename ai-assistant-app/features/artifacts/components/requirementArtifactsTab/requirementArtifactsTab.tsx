"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useIsMutating } from "@tanstack/react-query";
import {
  ARTIFACT_GENERATE_MUTATION_KEY,
  useArtifacts,
  useCreateArtifact,
  useRegenerateArtifact,
  useUpdateArtifact,
} from "@/features/artifacts/queries/artifacts.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ArtifactType } from "@/types/artifacts";
import { ArtifactEditor } from "./ArtifactEditor";
import { ArtifactList } from "./ArtifactList";
import { ArtifactPreview } from "./ArtifactPreview";
import {
  ARTIFACT_ORDER,
  EXCLUDED_ARTIFACT_TYPES,
  artifactLabel,
  isTestArtifactType,
} from "./artifactTab.constants";
import { createDraft, serializeDraft } from "./artifactTab.utils";
import type {
  ArtifactDraft,
  RequirementArtifactsTabProps,
} from "./artifactTab.types";
import styles from "./requirementArtifactsTab.module.scss";

export function RequirementArtifactsTab({
  projectId,
  requirementId,
}: RequirementArtifactsTabProps) {
  const [selectedArtifactType, setSelectedArtifactType] =
    useState<ArtifactType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draft, setDraft] = useState<ArtifactDraft | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const artifacts = useArtifacts(projectId, requirementId);
  const createArtifact = useCreateArtifact();
  const updateArtifact = useUpdateArtifact();
  const regenerateArtifact = useRegenerateArtifact();
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

  const isMutating =
    createArtifact.isPending ||
    updateArtifact.isPending ||
    regenerateArtifact.isPending;
  const isGeneratingArtifactsRequest = activeGenerateMutations > 0;

  function openArtifact(artifactType: ArtifactType) {
    setActionError(null);
    setIsEditMode(false);
    setDraft(null);
    setSelectedArtifactType(artifactType);
  }

  function closeModal() {
    if (isMutating) {
      return;
    }

    setActionError(null);
    setIsEditMode(false);
    setDraft(null);
    setSelectedArtifactType(null);
  }

  function startEdit() {
    if (!selectedArtifact) {
      return;
    }

    setActionError(null);
    setDraft(
      createDraft(selectedArtifact.artifact_type, selectedArtifact.content),
    );
    setIsEditMode(true);
  }

  function cancelEdit() {
    setActionError(null);
    setIsEditMode(false);
    setDraft(
      selectedArtifact
        ? createDraft(selectedArtifact.artifact_type, selectedArtifact.content)
        : null,
    );
  }

  async function handleSaveDraft() {
    if (!selectedArtifact || !draft) {
      return;
    }

    setActionError(null);

    try {
      await updateArtifact.mutateAsync({
        projectId,
        requirementId,
        artifactType: selectedArtifact.artifact_type,
        payload: {
          content: serializeDraft(selectedArtifact.artifact_type, draft),
        },
      });
      setIsEditMode(false);
      setActionError(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update artifact."));
    }
  }

  async function handleRegenerate() {
    if (!selectedArtifact) {
      return;
    }

    setActionError(null);

    try {
      await regenerateArtifact.mutateAsync({
        projectId,
        requirementId,
        artifactType: selectedArtifact.artifact_type,
      });
      setActionError(null);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to regenerate artifact."),
      );
    }
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
      </div>

      <Modal
        open={Boolean(selectedArtifact)}
        onClose={closeModal}
        title={
          selectedArtifact
            ? artifactLabel(selectedArtifact.artifact_type)
            : "Artifact"
        }
        closeDisabled={isMutating}
      >
        {selectedArtifact ? (
          <div className={styles.modalBody}>
            <p className={styles.modalSubtitle}>
              {isEditMode
                ? "Edit artifact fields and save your changes."
                : "Preview generated artifact content. Use Edit to unlock fields."}
            </p>

            {isEditMode ? (
              <ArtifactEditor
                artifactType={selectedArtifact.artifact_type}
                draft={draft}
                disabled={isMutating}
                onDraftChange={setDraft}
              />
            ) : (
              <section className={styles.previewBlock}>
                <h4 className={styles.previewTitle}>Artifact Content</h4>
                <ArtifactPreview
                  artifactType={selectedArtifact.artifact_type}
                  content={selectedArtifact.content}
                />
              </section>
            )}

            <div className={styles.modalActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleRegenerate()}
                disabled={isMutating}
              >
                {regenerateArtifact.isPending
                  ? "Regenerating..."
                  : "Regenerate"}
              </Button>

              {isEditMode ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={cancelEdit}
                    disabled={isMutating}
                  >
                    Cancel Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSaveDraft()}
                    disabled={isMutating}
                  >
                    {updateArtifact.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={startEdit}
                  disabled={isMutating}
                >
                  Edit
                </Button>
              )}

              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={isMutating}
              >
                Close
              </Button>
            </div>

            {actionError ? <p className={styles.error}>{actionError}</p> : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
