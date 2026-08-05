import { ProjectContextForm } from "@/features/projects/components/ProjectContextForm";
import styles from "./context.module.scss";

type ProjectContextPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectContextPage({
  params,
}: ProjectContextPageProps) {
  const { projectId } = await params;

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <h1 className={styles.title}>Project context</h1>
      </header>
      <ProjectContextForm projectId={projectId} />
    </div>
  );
}
