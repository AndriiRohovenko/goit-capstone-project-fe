import { ContentPage } from "@/components/ContentPage";
import { ProjectInfoForm } from "@/features/projects/components/ProjectInfoForm";
import styles from "./overview.module.scss";

type ProjectOverviewPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectOverviewPage({
  params,
}: ProjectOverviewPageProps) {
  const { projectId } = await params;

  return (
    <ContentPage>
      <div className={styles.page}>
        <header className={styles.toolbar}>
          <h1 className={styles.title}>Project overview</h1>
        </header>
        <ProjectInfoForm projectId={projectId} />
      </div>
    </ContentPage>
  );
}
