"use client";

import { RequirementArtifactsSection } from "@/features/artifacts/components/requirementArtifactsSection/requirementsArtifactsSection";
import { RequirementReviewSection } from "@/features/artifacts/components/requirementReviewSection/requirementReviewSection";
import { TestsCoverageSection } from "@/features/testsCoverage/components/testsCoverageSection/testsCoverageSection";
import styles from "./aiFeaturesSidebar.module.scss";

type AiFeaturesSidebarProps = {
  projectId: string;
  requirementId: string;
  onShowArtifacts: () => void;
};

export function AiFeaturesSidebar({
  projectId,
  requirementId,
  onShowArtifacts,
}: AiFeaturesSidebarProps) {
  return (
    <aside className={styles.panel}>
      <h3 className={styles.title}>AI Features</h3>

      <div className={styles.sections}>
        <RequirementReviewSection
          projectId={projectId}
          requirementId={requirementId}
        />

        <RequirementArtifactsSection
          projectId={projectId}
          requirementId={requirementId}
          onShowArtifacts={onShowArtifacts}
        />

        <TestsCoverageSection
          projectId={projectId}
          requirementId={requirementId}
        />
      </div>
    </aside>
  );
}
