"use client";

import Link from "next/link";
import { FilePenLine, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type Dispatch, type MouseEvent, type ReactNode, type SetStateAction } from "react";
import { Button } from "@/components/Button";
import { formatRelativeTime } from "@/features/projects/utils/format-relative-time";
import { useDeleteRequirement } from "@/features/requirements/queries/requirement.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Requirement } from "@/types/requirement";
import styles from "./RequirementList.module.scss";

type RequirementListProps = {
  projectId: string;
  requirements: Requirement[];
  groupNameById: Map<string, string>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  selectedGroupId: string | null;
  onRetry: () => void;
};

export function RequirementList({
  projectId,
  requirements,
  groupNameById,
  isLoading,
  isError,
  error,
  selectedGroupId,
  onRetry,
}: RequirementListProps) {
  const titleId = useId();
  const [openRequirementId, setOpenRequirementId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenRequirementId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenRequirementId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <span id={titleId} className={styles.srOnly}>
        Requirements list
      </span>

      {isLoading ? (
        <p className={styles.status}>Loading requirements…</p>
      ) : isError ? (
        <div className={styles.errorState}>
          <p className={styles.error}>
            Failed to load requirements
            {error instanceof Error ? `: ${error.message}` : "."}
          </p>
          <Button type="button" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : !requirements.length ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>No requirements found.</p>
          <p className={styles.emptySubtext}>
            {selectedGroupId
              ? "Try another group or clear the filter."
              : "Create the first requirement to start building this project."}
          </p>
        </div>
      ) : (
        <ul className={styles.list} role="list">
          {requirements.map((requirement) => (
            <RequirementListItem
              key={requirement.id}
              projectId={projectId}
              requirement={requirement}
              groupName={groupNameById.get(requirement.group_id)}
              openRequirementId={openRequirementId}
              setOpenRequirementId={setOpenRequirementId}
              menuRef={menuRef}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RequirementListItem({
  projectId,
  requirement,
  groupName,
  openRequirementId,
  setOpenRequirementId,
  menuRef,
}: {
  projectId: string;
  requirement: Requirement;
  groupName?: string;
  openRequirementId: string | null;
  setOpenRequirementId: Dispatch<SetStateAction<string | null>>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const deleteRequirement = useDeleteRequirement(projectId);
  const isOpen = openRequirementId === requirement.id;

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete requirement “${requirement.title}”? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setOpenRequirementId(null);

    try {
      await deleteRequirement.mutateAsync(requirement.id);
    } catch (err) {
      window.alert(getApiErrorMessage(err, "Failed to delete requirement."));
    }
  }

  function toggleMenu(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOpenRequirementId((current) => (current === requirement.id ? null : requirement.id));
  }

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <Link
          href={`/dashboard/projects/${projectId}/requirements/${requirement.id}`}
          className={styles.requirementName}
        >
          {requirement.title}
        </Link>

        <p className={styles.description}>
          {requirement.description.trim() || "No description yet."}
        </p>
      </div>

      <div className={styles.itemMeta}>
        <MetaBlock label="Type">
          <Tag tone="type">{formatLabel(requirement.requirement_type)}</Tag>
        </MetaBlock>

        <MetaBlock label="Priority">
          <Tag tone={priorityTone(requirement.priority)}>
            {formatLabel(requirement.priority)}
          </Tag>
        </MetaBlock>

        <MetaBlock label="Status">
          <Tag tone={statusTone(requirement.status)}>
            {formatLabel(requirement.status)}
          </Tag>
        </MetaBlock>

        <MetaBlock label="Group">
          <span className={styles.groupValue}>{groupName ?? "—"}</span>
        </MetaBlock>

        <MetaBlock label="Updated">
          <span className={styles.updatedValue}>
            {formatRelativeTime(requirement.updated_at)}
          </span>
        </MetaBlock>

        <div className={styles.actions} ref={isOpen ? menuRef : undefined}>
          <button
            type="button"
            className={styles.actionTrigger}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={`Actions for ${requirement.title}`}
            onClick={toggleMenu}
          >
            <MoreHorizontal size={18} strokeWidth={1.8} />
          </button>

          {isOpen ? (
            <div className={styles.menu} role="menu">
              <Link
                href={`/dashboard/projects/${projectId}/requirements/${requirement.id}`}
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpenRequirementId(null)}
              >
                <FilePenLine size={16} strokeWidth={1.8} />
                Edit requirement
              </Link>
              <div className={styles.divider} />
              <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                role="menuitem"
                disabled={deleteRequirement.isPending}
                onClick={() => void handleDelete()}
              >
                <Trash2 size={16} strokeWidth={1.8} />
                Delete requirement
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function MetaBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.metaBlock}>
      <span className={styles.metaLabel}>{label}</span>
      {children}
    </div>
  );
}

function Tag({ children, tone }: { children: string; tone: string }) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>;
}

function formatLabel(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function priorityTone(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "priorityHigh";
    case "low":
      return "priorityLow";
    default:
      return "priorityMedium";
  }
}

function statusTone(status: string) {
  switch (status.toLowerCase()) {
    case "analyzed":
      return "statusApproved";
    case "ready":
      return "statusReview";
    case "archived":
      return "statusArchived";
    default:
      return "statusDraft";
  }
}
