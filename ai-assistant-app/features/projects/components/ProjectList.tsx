"use client";

import Link from "next/link";
import { useProjects } from "@/features/projects/queries/projects.queries";
import styles from "./ProjectList.module.scss";

export function ProjectList() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useProjects();

  if (isPending) {
    return <p className={styles.status}>Loading projects…</p>;
  }

  if (isError) {
    return (
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
    );
  }

  if (!data.length) {
    return <p className={styles.status}>No projects yet.</p>;
  }

  return (
    <div className={styles.list}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Projects</h2>
        {isFetching ? (
          <span className={styles.refreshing}>Refreshing…</span>
        ) : null}
      </div>
      <ul className={styles.items}>
        {data.map((project) => (
          <li key={project.id}>
            <Link
              href={`/dashboard/projects/${project.id}/overview`}
              className={styles.projectLink}
            >
              <p className={styles.projectName}>{project.name}</p>
              {project.description ? (
                <p className={styles.description}>{project.description}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
