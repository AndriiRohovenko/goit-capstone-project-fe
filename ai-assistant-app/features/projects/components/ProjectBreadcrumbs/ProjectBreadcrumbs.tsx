"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useProject } from "@/features/projects/queries/projects.queries";
import { useRequirement } from "@/features/requirements/queries/requirement.queries";
import styles from "./ProjectBreadcrumbs.module.scss";

type ProjectBreadcrumbsProps = {
  projectId: string;
  children: ReactNode;
};

const sectionLabels: Record<string, string> = {
  context: "Project Context",
  groups: "Requirement Groups",
};

export function ProjectBreadcrumbs({ projectId, children }: ProjectBreadcrumbsProps) {
  const pathname = usePathname();
  const { data: project } = useProject(projectId);
  const pathParts = pathname.split("/").filter(Boolean);
  const projectSectionIndex = pathParts.indexOf("projects");
  const subRoute =
    projectSectionIndex >= 0 ? pathParts[projectSectionIndex + 2] : undefined;
  const nestedRoute =
    projectSectionIndex >= 0 ? pathParts[projectSectionIndex + 3] : undefined;

  const isRequirementDetail =
    subRoute === "requirements" && nestedRoute && nestedRoute !== "groups";
  const requirementId = isRequirementDetail ? nestedRoute : "";
  const { data: requirement } = useRequirement(projectId, requirementId);

  const currentLabel =
    subRoute === undefined
      ? null
      : subRoute === "requirements" && nestedRoute === "groups"
        ? sectionLabels.groups
        : subRoute === "requirements" && nestedRoute
          ? requirement?.title ?? "Requirement"
          : sectionLabels[subRoute] ?? "Requirements";

  const breadcrumbItems = [
    { label: "Projects", href: "/dashboard/projects" },
    {
      label: project?.name ?? "Project",
      href: `/dashboard/projects/${projectId}`,
    },
    ...(currentLabel ? [{ label: currentLabel }] : []),
  ];

  return (
    <div className={styles.wrapper}>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={styles.body}>{children}</div>
    </div>
  );
}