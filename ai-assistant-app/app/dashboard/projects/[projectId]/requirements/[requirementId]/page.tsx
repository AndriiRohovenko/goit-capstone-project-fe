"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { RequirementReviewForm } from "@/features/artifacts/components/requirementReviewForm/requirementReviewForm";
import { TestArtifactsForm } from "@/features/artifacts/components/testArtifactsForm/testArtifactsForm";
import { RequirementHeader } from "@/features/requirements/components/RequirementHeader";
import {
  RequirementDetailsForm,
  type RequirementTab,
} from "@/features/requirements/components/RequirementDetailsForm";
import { useRequirement } from "@/features/requirements/queries/requirement.queries";
import { useRequirementGroups } from "@/features/requirementGroups/queries/requirementGroups.queries";
import styles from "./requirement.module.scss";

type RequirementPageContentProps = {
  projectId: string;
  requirementId: string;
};

function RequirementPageContent({
  projectId,
  requirementId,
}: RequirementPageContentProps) {
  const [activeTab, setActiveTab] = useState<RequirementTab>("details");
  const {
    data: requirement,
    isPending,
    isError,
    error,
    refetch,
  } = useRequirement(projectId, requirementId);
  const { data: groups } = useRequirementGroups(projectId);

  if (isPending) {
    return <p className={styles.status}>Loading requirement...</p>;
  }

  if (isError || !requirement) {
    return (
      <div className={styles.errorState}>
        <p className={styles.error}>
          Failed to load requirement
          {error instanceof Error ? `: ${error.message}` : "."}
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const groupName = groups?.find(
    (group) => group.id === requirement.group_id,
  )?.name;

  return (
    <div className={styles.page}>
      <RequirementHeader
        projectId={projectId}
        requirement={requirement}
        groupName={groupName}
      />

      <div className={styles.contentGrid}>
        <div className={styles.analysisColumn}>
          <RequirementReviewForm
            projectId={projectId}
            requirementId={requirement.id}
          />

          <TestArtifactsForm
            projectId={projectId}
            requirementId={requirement.id}
            onShowArtifacts={() => setActiveTab("artifacts")}
          />
        </div>

        <RequirementDetailsForm
          projectId={projectId}
          requirement={requirement}
          groups={groups}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}

export default function RequirementPage() {
  const params = useParams();
  const projectId =
    typeof params.projectId === "string" ? params.projectId : null;
  const requirementId =
    typeof params.requirementId === "string" ? params.requirementId : null;

  if (!projectId || !requirementId) {
    return null;
  }

  return (
    <RequirementPageContent
      projectId={projectId}
      requirementId={requirementId}
    />
  );
}
