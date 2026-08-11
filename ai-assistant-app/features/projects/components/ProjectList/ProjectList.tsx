"use client";

import Link from "next/link";
import { FilePenLine, FolderPen, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useDeleteProject,
  useProjects,
} from "@/features/projects/queries/projects.queries";
import { formatRelativeTime } from "@/features/projects/utils/format-relative-time";
import { UpdateProjectForm } from "@/features/projects/components/UpdateProjectForm";
import type { Project, ProjectStatus } from "@/types/project";
import styles from "./ProjectList.module.scss";

export function ProjectList() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useProjects();
    
  const deleteProject = useDeleteProject();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailsProjectId, setDetailsProjectId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Delete project “${project.name}”? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setOpenMenuId(null);

    try {
      await deleteProject.mutateAsync(project.id);
    } catch (err) {
      window.alert(getApiErrorMessage(err, "Failed to delete project."));
    }
  }

  function toggleMenu(event: MouseEvent<HTMLButtonElement>, projectId: string) {
    event.preventDefault();
    event.stopPropagation();
    setOpenMenuId((current) => (current === projectId ? null : projectId));
  }

  function openDetailsModal(projectId: string) {
    setOpenMenuId(null);
    setDetailsProjectId(projectId);
  }

  function closeDetailsModal() {
    setDetailsProjectId(null);
  }

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <span id={titleId} className={styles.srOnly}>
        Projects list
      </span>
      {isFetching && !isPending ? (
        <p className={styles.refreshing}>Refreshing…</p>
      ) : null}

      {isPending ? (
        <p className={styles.status}>Loading projects…</p>
      ) : isError ? (
        <div className={styles.errorState}>
          <p className={styles.error}>
            Failed to load projects
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
      ) : !data.length ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>No projects yet.</p>
        </div>
      ) : (
        <ul className={styles.list} role="list">
          {data.map((project) => (
            <li key={project.id} className={styles.item}>
              <div className={styles.itemMain}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className={styles.projectName}
                >
                  {project.name}
                </Link>
                <p className={styles.description}>
                  {project.description?.trim() || "No description yet."}
                </p>
              </div>

              <div className={styles.itemMeta}>
                <div className={styles.metaBlock}>
                  <span className={styles.metaLabel}>Updated</span>
                  <span className={styles.mutedCell}>
                    {formatRelativeTime(
                      project.updated_at ?? project.created_at,
                    )}
                  </span>
                </div>

                <div className={styles.metaBlock}>
                  <span className={styles.metaLabel}>Status</span>
                  <StatusBadge status={project.status} />
                </div>

                <div className={styles.actions} ref={openMenuId === project.id ? menuRef : undefined}>
                  <button
                    type="button"
                    className={styles.actionTrigger}
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === project.id}
                    aria-label={`Actions for ${project.name}`}
                    onClick={(event) => toggleMenu(event, project.id)}
                  >
                    <MoreHorizontal size={18} strokeWidth={1.8} />
                  </button>

                  {openMenuId === project.id ? (
                    <div className={styles.menu} role="menu">
                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={() => openDetailsModal(project.id)}
                      >
                        <FilePenLine size={16} strokeWidth={1.8} />
                        Update project details
                      </button>
                      <Link
                        href={`/dashboard/projects/${project.id}/context`}
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <FolderPen size={16} strokeWidth={1.8} />
                        Update project context
                      </Link>
                      <div className={styles.divider} />
                      <button
                        type="button"
                        className={`${styles.menuItem} ${styles.danger}`}
                        role="menuitem"
                        disabled={deleteProject.isPending}
                        onClick={() => void handleDelete(project)}
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                        Delete project
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(detailsProjectId)}
        onClose={closeDetailsModal}
        title="Update Project Details"
      >
        {detailsProjectId ? (
          <UpdateProjectForm projectId={detailsProjectId} />
        ) : null}
      </Modal>
    </section>
  );
}

function StatusBadge({ status }: { status?: ProjectStatus }) {
  if (!status) {
    return <span className={styles.mutedCell}>—</span>;
  }

  const label = status === "active" ? "Active" : "Archived";
  const tone =
    status === "active" ? styles.statusActive : styles.statusArchived;

  return <span className={`${styles.statusBadge} ${tone}`}>{label}</span>;
}
