"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AddGroupForm } from "@/features/requirementGroups/components/addGroupForm";
import { RequirementGroupsList } from "@/features/requirementGroups/components/groupsList";
import { useRequirementGroups } from "@/features/requirementGroups/queries/requirementGroups.queries";
import { useRequirements } from "@/features/requirements/queries/requirement.queries";
import styles from "./groups.module.scss";

function RequirementGroupsPageContent({ projectId }: { projectId: string }) {
  const {
    data: groups,
    isPending: groupsPending,
    isError: groupsError,
    error: groupsErrorValue,
    refetch: refetchGroups,
  } = useRequirementGroups(projectId);
  const { data: requirements } = useRequirements(projectId);

  const countsByGroupId = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const requirement of requirements ?? []) {
      counts[requirement.group_id] = (counts[requirement.group_id] ?? 0) + 1;
    }

    return counts;
  }, [requirements]);

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Requirement Groups</h1>
          <p className={styles.subtitle}>
            Organize requirements into logical categories.
            <br />
            Groups help filter requirements and provide additional AI context.
          </p>
        </div>

        <AddGroupForm projectId={projectId} />
      </header>

      <RequirementGroupsList
        projectId={projectId}
        groups={groups}
        countsByGroupId={countsByGroupId}
        isLoading={groupsPending}
        isError={groupsError}
        error={groupsErrorValue}
        onRetry={() => void refetchGroups()}
      />
    </div>
  );
}

export default function RequirementsGroupsPage() {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : null;

  if (!projectId) {
    return null;
  }

  return <RequirementGroupsPageContent projectId={projectId} />;
}
