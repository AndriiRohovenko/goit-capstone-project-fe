"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import {
  Modal,
  ModalActions,
  ModalContentSections,
  ModalError,
} from "@/components/Modal";
import {
  useArtifacts,
  useCreateArtifact,
  useRegenerateArtifact,
} from "@/features/artifacts/queries/artifacts.queries";
import { copyToClipboard } from "@/lib/clipboard";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatAiContentValue, hasRenderableContent } from "@/lib/parse";
import styles from "./requirementReviewModal.module.scss";

type RequirementReviewModalProps = {
  projectId: string;
  requirementId: string;
  isOpen: boolean;
  onClose: () => void;
};

const REVIEW_ARTIFACT_TYPE = "requirement_review";

export function RequirementReviewModal({
  projectId,
  requirementId,
  isOpen,
  onClose,
}: RequirementReviewModalProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const artifacts = useArtifacts(projectId, requirementId);
  const createArtifact = useCreateArtifact();
  const regenerateArtifact = useRegenerateArtifact();

  const reviewArtifact = useMemo(
    () =>
      artifacts.data?.find(
        (artifact) => artifact.artifact_type === REVIEW_ARTIFACT_TYPE,
      ),
    [artifacts.data],
  );
  const reviewContent = reviewArtifact?.content;

  const reviewText = useMemo(
    () => formatAiContentValue(reviewContent),
    [reviewContent],
  );

  const hasReview = Boolean(reviewArtifact);
  const isGenerating = createArtifact.isPending || regenerateArtifact.isPending;

  function handleClose() {
    if (isGenerating) {
      return;
    }

    setActionError(null);
    setCopiedKey(null);
    onClose();
  }

  async function handleGenerateOrRegenerate() {
    setActionError(null);

    try {
      if (hasReview) {
        await regenerateArtifact.mutateAsync({
          projectId,
          requirementId,
          artifactType: REVIEW_ARTIFACT_TYPE,
        });
        return;
      }

      await createArtifact.mutateAsync({
        projectId,
        requirementId,
        payload: { generation_type: "requirement_review" },
      });
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to generate requirement review."),
      );
    }
  }

  async function handleCopyContent() {
    await copyToClipboard(
      { setCopiedKey, setActionError },
      "content",
      reviewText,
    );
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="AI Requirement Review"
      closeDisabled={isGenerating}
    >
      <div className={styles.modalBody}>
        <p className={styles.modalSubtitle}>
          AI-generated review and suggestions based on the requirement content.
        </p>

        <ModalActions>
          <Button
            type="button"
            onClick={() => void handleGenerateOrRegenerate()}
            disabled={isGenerating}
          >
            {isGenerating
              ? "Generating..."
              : hasReview
                ? "Regenerate review"
                : "Generate review"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleCopyContent()}
            disabled={!hasRenderableContent(reviewContent)}
          >
            {copiedKey === "content" ? "Copied" : "Copy content"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Close
          </Button>
        </ModalActions>

        <ModalError message={actionError} />

        {artifacts.isPending ? (
          <p className={styles.empty}>Loading review...</p>
        ) : (
          <ModalContentSections
            content={reviewContent}
            emptyText="No review content available yet."
          />
        )}
      </div>
    </Modal>
  );
}
