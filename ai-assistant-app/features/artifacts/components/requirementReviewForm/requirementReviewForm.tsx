"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import {
  useArtifacts,
  useCreateArtifact,
  useRegenerateArtifact,
} from "@/features/artifacts/queries/artifacts.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Artifact } from "@/types/artifacts";
import styles from "./requirementReviewForm.module.scss";

type RequirementReviewFormProps = {
  projectId: string;
  requirementId: string;
};

type ReviewData = {
  summary: string;
  ambiguities: string[];
  suggestions: string[];
  qualityIssues: string[];
  missingDetails: string[];
};

const REVIEW_ARTIFACT_TYPE = "requirement_review";

export function RequirementReviewForm({
  projectId,
  requirementId,
}: RequirementReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
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

    setIsOpen(false);
    setActionError(null);
    setCopiedKey(null);
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
      <section className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>AI Requirement Analysis</h3>
        </div>

        <div className={styles.card}>
          <h4 className={styles.cardTitle}>AI Requirement Review</h4>
          <p className={styles.description}>
            Review this requirement for clarity, testability, completeness and
            potential issues.
          </p>

          <Button
            type="button"
            className={styles.actionButton}
            onClick={() => {
              setActionError(null);
              setIsOpen(true);
            }}
            disabled={artifacts.isPending}
          >
            <Sparkles size={16} strokeWidth={2.1} />
            AI Review Requirement
          </Button>
        </div>
      </section>

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

          <div className={styles.modalActions}>
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
          </div>

          {actionError ? <p className={styles.error}>{actionError}</p> : null}

          {artifacts.isPending ? (
            <p className={styles.empty}>Loading review...</p>
          ) : review ? (
            <div className={styles.reviewGrid}>
              <section className={styles.blockWide}>
                <h4 className={styles.blockTitle}>Summary</h4>
                <p className={styles.summary}>{review.summary}</p>
              </section>

              <ReviewListBlock title="Ambiguities" items={review.ambiguities} />

              <ReviewListBlock
                title="Suggestions"
                items={review.suggestions}
                onCopy={() => void copyItems("suggestions", review.suggestions)}
                isCopied={copiedKey === "suggestions"}
              />

              <ReviewListBlock
                title="Quality Issues"
                items={review.qualityIssues}
              />

              <ReviewListBlock
                title="Missing Details"
                items={review.missingDetails}
                onCopy={() => void copyItems("missing", review.missingDetails)}
                isCopied={copiedKey === "missing"}
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

function ReviewListBlock({
  title,
  items,
  onCopy,
  isCopied = false,
}: {
  title: string;
  items: string[];
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <section className={styles.block}>
      <div className={styles.blockHeader}>
        <h4 className={styles.blockTitle}>{title}</h4>
        {onCopy ? (
          <Button type="button" variant="secondary" onClick={onCopy}>
            {isCopied ? "Copied" : "Copy"}
          </Button>
        ) : null}
      </div>

      {items.length ? (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No items.</p>
      )}
    </section>
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
