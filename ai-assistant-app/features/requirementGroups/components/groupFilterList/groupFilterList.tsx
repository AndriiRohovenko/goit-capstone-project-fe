"use client";

import { Folder, FolderPlus, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/Loader";
import type { RequirementGroup } from "@/types/requirementGroup";
import styles from "./groupFilterList.module.scss";

type RequirementGroupFilterListProps = {
  projectId: string;
  groups?: RequirementGroup[];
  isLoading: boolean;
  selectedGroupId: string | null;
  totalCount: number;
  countsByGroupId: Record<string, number>;
  onSelectGroup: (groupId: string | null) => void;
};

export function RequirementGroupFilterList({
  projectId,
  groups,
  isLoading,
  selectedGroupId,
  onSelectGroup,
}: RequirementGroupFilterListProps) {
  const router = useRouter();
  const hasGroups = Boolean(groups?.length);

  return (
    <section className={styles.card} aria-labelledby="requirement-group-filter">
      <div className={styles.heading}>
        <h2 id="requirement-group-filter" className={styles.title}>
          Filter by Requirement Group
        </h2>
      </div>

      {isLoading ? (
        <Loader size="sm" label="Loading groups..." />
      ) : (
        <div
          className={styles.chips}
          role="list"
          aria-label="Requirement groups filter"
        >
          {hasGroups ? (
            <FilterChip
              active={selectedGroupId === null}
              icon={Folder}
              label="All Groups"
              onClick={() => onSelectGroup(null)}
            />
          ) : (
            <FilterChip
              active={false}
              icon={FolderPlus}
              label="Add Group"
              onClick={() =>
                router.push(
                  `/dashboard/projects/${projectId}/requirements/groups`,
                )
              }
            />
          )}

          {groups?.map((group) => (
            <FilterChip
              key={group.id}
              active={selectedGroupId === group.id}
              icon={Folder}
              label={group.name}
              onClick={() => onSelectGroup(group.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.chip}${active ? ` ${styles.chipActive}` : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={styles.icon}>
        <Icon size={14} strokeWidth={2} />
      </span>
      <span className={styles.chipLabel}>{label}</span>
    </button>
  );
}
