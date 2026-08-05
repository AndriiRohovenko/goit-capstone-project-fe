'use client';

import { Folder } from "lucide-react";
import { useRequirementGroups } from "@/features/requirementGroups/queries/requirementGroups.queries";
import type { RequirementGroup } from "@/types/requirementGroup";
import styles from "./groupList.module.scss";

type RequirementGroupListProps = {
  projectId: string;
  selectedGroupId: string | null;
  totalCount: number;
  countsByGroupId: Record<string, number>;
  onSelectGroup: (groupId: string | null) => void;
};

export const RequirementGroupList = ({
  projectId,
  selectedGroupId,
  totalCount,
  countsByGroupId,
  onSelectGroup,
}: RequirementGroupListProps) => {
  const { data: requirementGroups, isPending } = useRequirementGroups(projectId);

  return (
    <section className={styles.card} aria-labelledby="requirement-group-filter">
      <div className={styles.heading}>
        <h2 id="requirement-group-filter" className={styles.title}>
          Filter by Requirement Group
        </h2>
      </div>

      {isPending ? (
        <p className={styles.status}>Loading groups…</p>
      ) : (
        <div className={styles.chips} role="list" aria-label="Requirement groups filter">
          <FilterChip
            active={selectedGroupId === null}
            icon={<Folder size={14} strokeWidth={2} />}
            label="All Groups"
            count={totalCount}
            onClick={() => onSelectGroup(null)}
          />

          {requirementGroups?.map((group: RequirementGroup) => (
            <FilterChip
              key={group.id}
              active={selectedGroupId === group.id}
              icon={<Folder size={14} strokeWidth={2} />}
              label={group.name}
              count={countsByGroupId[group.id] ?? 0}
              onClick={() => onSelectGroup(group.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

function FilterChip({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.chip}${active ? ` ${styles.chipActive}` : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.chipLabel}>{label}</span>
      <span className={styles.count}>{count}</span>
    </button>
  );
}