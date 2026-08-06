"use client";

import Link from "next/link";
import { FilePenLine, MoreHorizontal, Trash2 } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import {
  RequirementGroupForm,
  type RequirementGroupFormValues,
} from "@/features/requirementGroups/components/addGroupForm";
import {
  useDeleteRequirementGroup,
  useUpdateRequirementGroup,
} from "@/features/requirementGroups/queries/requirementGroups.queries";
import { formatRelativeTime } from "@/features/projects/utils/format-relative-time";
import { getApiErrorMessage } from "@/lib/api-error";
import type { RequirementGroup } from "@/types/requirementGroup";
import styles from "./groupsList.module.scss";

function normalizeDescription(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

type RequirementGroupsListProps = {
  projectId: string;
  groups?: RequirementGroup[];
  countsByGroupId: Record<string, number>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
};

export function RequirementGroupsList({
  projectId,
  groups,
  countsByGroupId,
  isLoading,
  isError,
  error,
  onRetry,
}: RequirementGroupsListProps) {
  const titleId = useId();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
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
        Requirement groups list
      </span>

      {isLoading ? (
        <p className={styles.status}>Loading groups...</p>
      ) : isError ? (
        <div className={styles.errorState}>
          <p className={styles.error}>
            Failed to load requirement groups
            {error instanceof Error ? `: ${error.message}` : "."}
          </p>
          <Button type="button" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : !groups?.length ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>No requirement groups yet.</p>
        </div>
      ) : (
        <ul className={styles.list} role="list">
          {groups.map((group) => (
            <RequirementGroupRow
              key={group.id}
              projectId={projectId}
              group={group}
              requirementsCount={countsByGroupId[group.id] ?? 0}
              isMenuOpen={openMenuId === group.id}
              setOpenMenuId={setOpenMenuId}
              menuRef={menuRef}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RequirementGroupRow({
  projectId,
  group,
  requirementsCount,
  isMenuOpen,
  setOpenMenuId,
  menuRef,
}: {
  projectId: string;
  group: RequirementGroup;
  requirementsCount: number;
  isMenuOpen: boolean;
  setOpenMenuId: (id: string | null) => void;
  menuRef: RefObject<HTMLDivElement | null>;
}) {
  const updateGroup = useUpdateRequirementGroup(projectId);
  const deleteGroup = useDeleteRequirementGroup(projectId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete requirement group "${group.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setOpenMenuId(null);

    try {
      await deleteGroup.mutateAsync(group.id);
    } catch (err) {
      window.alert(getApiErrorMessage(err, "Failed to delete requirement group."));
    }
  }

  async function handleEditSubmit(values: RequirementGroupFormValues) {
    setEditError(null);

    try {
      await updateGroup.mutateAsync({
        groupId: group.id,
        payload: {
          name: values.name.trim(),
          description: normalizeDescription(values.description),
        },
      });
      setIsEditOpen(false);
      setOpenMenuId(null);
    } catch (err) {
      setEditError(getApiErrorMessage(err, "Failed to update requirement group."));
    }
  }

  function closeEditModal() {
    if (updateGroup.isPending) {
      return;
    }

    setIsEditOpen(false);
    setEditError(null);
  }

  function openEditModal() {
    setEditError(null);
    setIsEditOpen(true);
  }

  function toggleMenu(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOpenMenuId(isMenuOpen ? null : group.id);
  }

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className={styles.groupName}
        >
          {group.name}
        </Link>

        <p className={styles.description}>
          {normalizeDescription(group.description) || "No description yet."}
        </p>
      </div>

      <div className={styles.itemMeta}>
        <MetaBlock label="Requirements">
          <span className={styles.countTag}>{requirementsCount}</span>
        </MetaBlock>

        <MetaBlock label="Updated">
          <span className={styles.updatedValue}>
            {formatRelativeTime(group.updated_at)}
          </span>
        </MetaBlock>

        <div className={styles.actions} ref={isMenuOpen ? menuRef : undefined}>
          <button
            type="button"
            className={styles.actionTrigger}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label={`Actions for ${group.name}`}
            onClick={toggleMenu}
          >
            <MoreHorizontal size={18} strokeWidth={1.8} />
          </button>

          {isMenuOpen ? (
            <div className={styles.menu} role="menu">
              <button
                type="button"
                className={styles.menuItem}
                role="menuitem"
                disabled={updateGroup.isPending}
                onClick={openEditModal}
              >
                <FilePenLine size={16} strokeWidth={1.8} />
                Edit group
              </button>
              <div className={styles.divider} />
              <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                role="menuitem"
                disabled={deleteGroup.isPending}
                onClick={() => void handleDelete()}
              >
                <Trash2 size={16} strokeWidth={1.8} />
                Delete group
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        open={isEditOpen}
        onClose={closeEditModal}
        title="Edit Requirement Group"
        closeDisabled={updateGroup.isPending}
      >
        <RequirementGroupForm
          defaultValues={{
            name: group.name,
            description: normalizeDescription(group.description),
          }}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isSubmitting={updateGroup.isPending}
          error={editError}
          onCancel={closeEditModal}
          onSubmit={handleEditSubmit}
        />
      </Modal>
    </li>
  );
}

function MetaBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.metaBlock}>
      <span className={styles.metaLabel}>{label}</span>
      {children}
    </div>
  );
}