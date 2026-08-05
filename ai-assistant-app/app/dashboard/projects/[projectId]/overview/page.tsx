import { UpdateProjectForm } from "@/features/projects/components/UpdateProjectForm/UpdateProjectForm";
import styles from "./overview.module.scss";

type ProjectOverviewPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectOverviewPage({
  params,
}: ProjectOverviewPageProps) {
  const { projectId } = await params;

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <h1 className={styles.title}>Project overview</h1>
      </header>
      <UpdateProjectForm projectId={projectId} />
    </div>
  );
}
