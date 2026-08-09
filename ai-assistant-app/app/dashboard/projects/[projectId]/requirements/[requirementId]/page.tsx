"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { RequirementReviewForm } from "@/features/artifacts/components/requirementReviewForm/requirementReviewForm";
import { RequirementHeader } from "@/features/requirements/components/RequirementHeader";
import { RequirementDetailsForm } from "@/features/requirements/components/RequirementDetailsForm";
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
        <RequirementReviewForm
          projectId={projectId}
          requirementId={requirement.id}
        />

        <RequirementDetailsForm
          projectId={projectId}
          requirement={requirement}
          groups={groups}
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
