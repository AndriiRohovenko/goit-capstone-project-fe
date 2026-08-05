"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/Button";
import { RequirementGroupList } from "@/features/requirementGroups/components/groupList";
import { useRequirementGroups } from "@/features/requirementGroups/queries/requirementGroups.queries";
import { CreateRequirement } from "@/features/requirements/components/CreateRequirement";
import { RequirementList } from "@/features/requirements/components/RequirementList";
import { useRequirements } from "@/features/requirements/queries/requirement.queries";
import styles from "./requirements.module.scss";

type RequirementsPageContentProps = {
  projectId: string;
};

function RequirementsPageContent({ projectId }: RequirementsPageContentProps) {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const {
    data: requirements,
    isPending: requirementsPending,
    isError: requirementsError,
    error: requirementsErrorValue,
    refetch: refetchRequirements,
  } = useRequirements(projectId);
  const {
    data: requirementGroups,
    isError: groupsError,
    refetch: refetchGroups,
  } = useRequirementGroups(projectId);

  const countsByGroupId = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const requirement of requirements ?? []) {
      counts[requirement.group_id] = (counts[requirement.group_id] ?? 0) + 1;
    }

    return counts;
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    if (!selectedGroupId) {
      return requirements ?? [];
    }

    return (requirements ?? []).filter(
      (requirement) => requirement.group_id === selectedGroupId,
    );
  }, [requirements, selectedGroupId]);

  const groupNameById = useMemo(
    () => new Map((requirementGroups ?? []).map((group) => [group.id, group.name])),
    [requirementGroups],
  );

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Requirements</h1>
          <p className={styles.subtitle}>
            Manage and organize all requirements for your project.
            <br />
            Use groups to filter and structure requirements.
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/dashboard/projects/${projectId}/requirements/groups`)}
          >
            <Settings size={16} strokeWidth={2} />
            Manage Groups
          </Button>

          <CreateRequirement projectId={projectId} />
        </div>
      </header>

      <RequirementGroupList
        projectId={projectId}
        selectedGroupId={selectedGroupId}
        totalCount={requirements?.length ?? 0}
        countsByGroupId={countsByGroupId}
        onSelectGroup={setSelectedGroupId}
      />

      <RequirementList
        projectId={projectId}
        requirements={filteredRequirements}
        groupNameById={groupNameById}
        isLoading={requirementsPending}
        isError={requirementsError}
        error={requirementsErrorValue}
        onRetry={() => void refetchRequirements()}
        selectedGroupId={selectedGroupId}
      />

      {groupsError ? (
        <div className={styles.helperRow}>
          <p className={styles.helperText}>Requirement groups could not be loaded.</p>
          <Button type="button" variant="secondary" onClick={() => void refetchGroups()}>
            Retry groups
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function RequirementsPage() {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : null;

  if (!projectId) {
    return null;
  }
  return <RequirementsPageContent projectId={projectId} />;
}
