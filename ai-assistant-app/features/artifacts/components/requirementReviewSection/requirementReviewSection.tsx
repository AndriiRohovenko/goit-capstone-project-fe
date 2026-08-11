"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { RequirementReviewForm } from "@/features/artifacts/components/requirementReviewForm/requirementReviewForm";
import styles from "./requirementReviewSection.module.scss";

type RequirementReviewSectionProps = {
  projectId: string;
  requirementId: string;
};

export function RequirementReviewSection({
  projectId,
  requirementId,
}: RequirementReviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className={styles.card}>
        <h4 className={styles.cardTitle}>AI Requirement Review</h4>
        <p className={styles.description}>
          Review this requirement for clarity, testability, completeness and
          potential issues.
        </p>

        <Button
          type="button"
          className={styles.actionButton}
          onClick={() => setIsOpen(true)}
        >
          <Sparkles size={16} strokeWidth={2.1} />
          AI Review Requirement
        </Button>
      </section>

      <RequirementReviewForm
        projectId={projectId}
        requirementId={requirementId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
