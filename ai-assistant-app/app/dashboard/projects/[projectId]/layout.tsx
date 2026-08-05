import type { ReactNode } from "react";
import { ContentPage } from "@/components/ContentPage";
import { ProjectBreadcrumbs } from "@/features/projects/components/ProjectBreadcrumbs";

type ProjectLayoutProps = {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
};

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectId } = await params;

  return (
    <ContentPage>
      <ProjectBreadcrumbs projectId={projectId}>{children}</ProjectBreadcrumbs>
    </ContentPage>
  );
}