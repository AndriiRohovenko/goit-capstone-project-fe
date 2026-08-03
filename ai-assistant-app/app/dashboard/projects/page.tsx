import { ContentPage } from "@/components/ContentPage";
import { CreateProject } from "@/features/projects/components/CreateProject";
import { ProjectList } from "@/features/projects/components/ProjectList";
import styles from "./projects.module.scss";

export default function ProjectsPage() {
  return (
    <ContentPage>
      <div className={styles.page}>
        <header className={styles.toolbar}>
          <h1 className={styles.title}>Projects</h1>
          <CreateProject />
        </header>
        <ProjectList />
      </div>
    </ContentPage>
  );
}
