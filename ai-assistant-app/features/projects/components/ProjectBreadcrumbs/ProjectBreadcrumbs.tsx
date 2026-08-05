"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useProject } from "@/features/projects/queries/projects.queries";
import styles from "./ProjectBreadcrumbs.module.scss";

type ProjectBreadcrumbsProps = {
  projectId: string;
  children: ReactNode;
};

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  context: "Context",
  requirements: "Requirements",
  groups: "Requirement Groups",
};

export function ProjectBreadcrumbs({ projectId, children }: ProjectBreadcrumbsProps) {
  const pathname = usePathname();
  const { data: project } = useProject(projectId);

  const pathParts = pathname.split("/").filter(Boolean);
  const currentSection = pathParts[pathParts.length - 1] ?? "overview";
  const currentLabel =
    sectionLabels[currentSection] ??
    (pathParts.includes("groups") ? "Requirement Group" : "Overview");

  return (
    <div className={styles.wrapper}>
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/dashboard/projects" },
          {
            label: project?.name ?? "Project"
          },
          { label: currentLabel },
        ]}
      />
      <div className={styles.body}>{children}</div>
    </div>
  );
}