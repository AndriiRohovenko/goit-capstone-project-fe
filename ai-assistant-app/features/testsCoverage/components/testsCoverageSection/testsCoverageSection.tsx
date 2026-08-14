"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { TestsCoverageModal } from "@/features/testsCoverage/components/testsCoverageModal/testsCoverageModal";
import styles from "./testsCoverageSection.module.scss";

type TestsCoverageSectionProps = {
  projectId: string;
  requirementId: string;
};

export function TestsCoverageSection({
  projectId,
  requirementId,
}: TestsCoverageSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className={styles.card}>
        <h4 className={styles.cardTitle}>AI Test Coverage Review</h4>
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
          AI Review Test Coverage
        </Button>
      </section>

      <TestsCoverageModal
        projectId={projectId}
        requirementId={requirementId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
