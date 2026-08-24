"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Artifact } from "@/types/artifacts";
import { useRegenerateArtifact, useUpdateArtifact } from "@/features/artifacts/queries/artifacts.queries";
import { ArtifactEditor } from "./ArtifactEditor";
import { ArtifactPreview } from "./ArtifactPreview";
import { artifactLabel } from "./artifactTab.constants";
import { serializeDraft } from "./artifactTab.utils";
import { useArtifactDraftController } from "./useArtifactDraftController";
import styles from "./requirementArtifactsTab.module.scss";

type ArtifactEditorModalProps = {
  projectId: string;
  requirementId: string;
  artifact: Artifact | null;
  open: boolean;
  onClose: () => void;
};

export function ArtifactEditorModal({
  projectId,
  requirementId,
  artifact,
  open,
  onClose,
}: ArtifactEditorModalProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const updateArtifact = useUpdateArtifact();
  const regenerateArtifact = useRegenerateArtifact();
  const controller = useArtifactDraftController({ artifact });

  const isMutating = updateArtifact.isPending || regenerateArtifact.isPending;

  if (!artifact) {
    return null;
  }

  const activeArtifact = artifact as Artifact;

  function handleClose() {
    if (isMutating) {
      return;
    }

    setActionError(null);
    onClose();
  }

  async function handleSaveDraft() {
    if (!controller.draft) {
      return;
    }

    setActionError(null);

    try {
      await updateArtifact.mutateAsync({
        projectId,
        requirementId,
        artifactType: activeArtifact.artifact_type,
        payload: {
          content: serializeDraft(
            activeArtifact.artifact_type,
            controller.draft,
          ),
        },
      });
      controller.commitDraft();
      setActionError(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update artifact."));
    }
  }

  async function handleRegenerate() {
    setActionError(null);

    try {
      await regenerateArtifact.mutateAsync({
        projectId,
        requirementId,
        artifactType: activeArtifact.artifact_type,
      });
      setActionError(null);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to regenerate artifact."),
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={artifactLabel(activeArtifact.artifact_type)}
      closeDisabled={isMutating}
      closeGuard={() => !controller.isEditMode || !controller.isDraftDirty}
    >
      <div className={styles.modalBody}>
        <p className={styles.modalSubtitle}>
          {controller.isEditMode
            ? "Edit artifact fields and save your changes."
            : "Preview generated artifact content. Use Edit to unlock fields."}
        </p>

        {controller.isEditMode ? (
          <ArtifactEditor
            artifactType={activeArtifact.artifact_type}
            draft={controller.draft}
            disabled={isMutating}
            onDraftChange={controller.setDraft}
          />
        ) : (
          <section className={styles.previewBlock}>
            <h4 className={styles.previewTitle}>Artifact Content</h4>
            <ArtifactPreview
              artifactType={activeArtifact.artifact_type}
              content={activeArtifact.content}
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
            {regenerateArtifact.isPending ? "Regenerating..." : "Regenerate"}
          </Button>

          {controller.isEditMode ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  controller.cancelEdit();
                  setActionError(null);
                }}
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
              onClick={() => {
                controller.startEdit();
                setActionError(null);
              }}
              disabled={isMutating}
            >
              Edit
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isMutating}
          >
            Close
          </Button>
        </div>

        {actionError ? <p className={styles.error}>{actionError}</p> : null}
      </div>
    </Modal>
  );
}
