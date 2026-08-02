"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePenLine,
  FolderPen,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from "@/features/projects/queries/projects.queries";
import { formatRelativeTime } from "@/features/projects/utils/format-relative-time";
import type { Project, ProjectStatus } from "@/types/project";
import styles from "./ProjectList.module.scss";

export function ProjectList() {
  const router = useRouter();
  const { data, isPending, isError, error, refetch, isFetching } =
    useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
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
        setIsCreateOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Project name is required.");
      return;
    }

    setFormError(null);

    try {
      const project = await createProject.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
      });
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      router.push(`/dashboard/projects/${project.id}/overview`);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Failed to create project."));
    }
  }

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

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <h1 className={styles.title} id={titleId}>
            Projects
          </h1>
          {isFetching && !isPending ? (
            <span className={styles.refreshing}>Refreshing…</span>
          ) : null}
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            setFormError(null);
            setIsCreateOpen(true);
          }}
        >
          <Plus size={18} strokeWidth={2.2} />
          New Project
        </button>
      </div>

      <section className={styles.panel} aria-labelledby={titleId}>
        {isPending ? (
          <p className={styles.status}>Loading projects…</p>
        ) : isError ? (
          <div className={styles.errorState}>
            <p className={styles.error}>
              Failed to load projects
              {error instanceof Error ? `: ${error.message}` : "."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className={styles.retry}
            >
              Retry
            </button>
          </div>
        ) : !data.length ? (
          <div className={styles.emptyState}>
            <p className={styles.status}>No projects yet.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={18} strokeWidth={2.2} />
              Create your first project
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Project Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={styles.actionsCol}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link
                        href={`/dashboard/projects/${project.id}/overview`}
                        className={styles.projectName}
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className={styles.mutedCell}>
                      {project.description?.trim() || "—"}
                    </td>
                    <td className={styles.mutedCell}>
                      {formatRelativeTime(project.updatedAt ?? project.createdAt)}
                    </td>
                    <td>
                      <StatusBadge status={project.status} />
                    </td>
                    <td className={styles.actionsCol}>
                      <div
                        className={styles.actions}
                        ref={openMenuId === project.id ? menuRef : undefined}
                      >
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
                            <Link
                              href={`/dashboard/projects/${project.id}/overview`}
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <FilePenLine size={16} strokeWidth={1.8} />
                              Update project base info
                            </Link>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isCreateOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => {
            if (!createProject.isPending) {
              setIsCreateOpen(false);
            }
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="create-project-title" className={styles.modalTitle}>
              New Project
            </h2>
            <form className={styles.form} onSubmit={(event) => void handleCreate(event)}>
              <label className={styles.label}>
                Name
                <input
                  className={styles.input}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Checkout Flow"
                  autoFocus
                  required
                />
              </label>
              <label className={styles.label}>
                Description
                <textarea
                  className={styles.textarea}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional short summary"
                  rows={3}
                />
              </label>
              {formError ? <p className={styles.error}>{formError}</p> : null}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setIsCreateOpen(false)}
                  disabled={createProject.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status?: ProjectStatus }) {
  if (!status) {
    return <span className={styles.mutedCell}>—</span>;
  }

  const label = status === "active" ? "Active" : "Draft";
  const tone = status === "active" ? styles.statusActive : styles.statusDraft;

  return <span className={`${styles.statusBadge} ${tone}`}>{label}</span>;
}
