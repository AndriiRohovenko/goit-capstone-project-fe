"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import {
  Modal,
  ModalActions,
  ModalError,
  ModalInfoListBlock,
} from "@/components/Modal";
import {
  useArtifacts,
  useCreateArtifact,
  useRegenerateArtifact,
} from "@/features/artifacts/queries/artifacts.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Artifact } from "@/types/artifacts";
import styles from "./requirementReviewModal.module.scss";

type RequirementReviewModalProps = {
  projectId: string;
  requirementId: string;
  isOpen: boolean;
  onClose: () => void;
};

type ReviewData = {
  summary: string;
  ambiguities: string[];
  suggestions: string[];
  qualityIssues: string[];
  missingDetails: string[];
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

  const review = useMemo(() => parseReview(reviewArtifact), [reviewArtifact]);
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

  async function copyItems(key: string, values: string[]) {
    if (!values.length || typeof navigator === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(values.join("\n"));
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setActionError("Could not copy to clipboard.");
    }
  }

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleClose}
        title="AI Requirement Review"
        closeDisabled={isGenerating}
      >
        <div className={styles.modalBody}>
          <p className={styles.modalSubtitle}>
            AI-generated review and suggestions based on the requirement
            content.
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
              onClick={handleClose}
              disabled={isGenerating}
            >
              Close
            </Button>
          </ModalActions>

          <ModalError message={actionError} />

          {artifacts.isPending ? (
            <p className={styles.empty}>Loading review...</p>
          ) : review ? (
            <div className={styles.reviewGrid}>
              <section className={styles.blockWide}>
                <h4 className={styles.blockTitle}>Summary</h4>
                <p className={styles.summary}>{review.summary}</p>
              </section>

              <ModalInfoListBlock
                title="Ambiguities"
                items={review.ambiguities}
              />

              <ModalInfoListBlock
                title="Suggestions"
                items={review.suggestions}
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void copyItems("suggestions", review.suggestions)
                    }
                  >
                    {copiedKey === "suggestions" ? "Copied" : "Copy"}
                  </Button>
                }
              />

              <ModalInfoListBlock
                title="Quality Issues"
                items={review.qualityIssues}
              />

              <ModalInfoListBlock
                title="Missing Details"
                items={review.missingDetails}
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void copyItems("missing", review.missingDetails)
                    }
                  >
                    {copiedKey === "missing" ? "Copied" : "Copy"}
                  </Button>
                }
              />
            </div>
          ) : (
            <p className={styles.empty}>
              No review generated yet. Click Generate review to create one.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

function parseReview(artifact?: Artifact): ReviewData | null {
  const content = toObject(artifact?.content);

  if (!content) {
    return null;
  }

  const summary = readString(content.summary);

  if (!summary) {
    return null;
  }

  return {
    summary,
    ambiguities: readStringArray(content.ambiguities),
    suggestions: readStringArray(content.suggestions),
    qualityIssues: readStringArray(content.quality_issues),
    missingDetails: readStringArray(content.missing_details),
  };
}

function toObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}
