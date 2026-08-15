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
  useCreateTestsCoverage,
  useTestsCoverage,
} from "@/features/testsCoverage/queries/testsCoverage.queries";
import { copyToClipboard } from "@/lib/clipboard";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatAiContentValue, hasRenderableContent } from "@/lib/parse";
import styles from "./testsCoverageModal.module.scss";

type TestsCoverageModalProps = {
  projectId: string;
  requirementId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function TestsCoverageModal({
  projectId,
  requirementId,
  isOpen,
  onClose,
}: TestsCoverageModalProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const coverageQuery = useTestsCoverage(projectId, requirementId);
  const createCoverage = useCreateTestsCoverage();

  const coverageContent = coverageQuery.data?.content;
  const coverageScore = coverageQuery.data?.coverage_score ?? null;
  const hasCoverage = Boolean(coverageQuery.data);
  const isGenerating = createCoverage.isPending;

  const contentText = useMemo(
    () => formatAiContentValue(coverageContent),
    [coverageContent],
  );

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
      const result = await createCoverage.mutateAsync({
        projectId,
        requirementId,
      });

      if (!result) {
        setActionError("Failed to generate tests coverage review.");
      }
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to generate tests coverage review."),
      );
    }
  }

  async function handleCopyContent() {
    await copyToClipboard(
      { setCopiedKey, setActionError },
      "content",
      contentText,
    );
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="AI Test Coverage Review"
      closeDisabled={isGenerating}
    >
      <div className={styles.modalBody}>
        <p className={styles.modalSubtitle}>
          AI-generated test coverage analysis and recommendations.
        </p>
        <div className={styles.coverageBadge}>
          Coverage Score: {coverageScore ?? "N/A"}
        </div>

        <ModalActions>
          <Button
            type="button"
            onClick={() => void handleGenerateOrRegenerate()}
            disabled={isGenerating}
          >
            {isGenerating
              ? "Generating..."
              : hasCoverage
                ? "Regenerate coverage"
                : "Generate coverage"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleCopyContent()}
            disabled={!hasRenderableContent(coverageContent)}
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

        {coverageQuery.isPending ? (
          <p className={styles.empty}>Loading coverage...</p>
        ) : (
          <ModalContentSections
            content={coverageContent}
            emptyText="No coverage content available yet."
          />
        )}
      </div>
    </Modal>
  );
}
