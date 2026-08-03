"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateProject } from "@/features/projects/queries/projects.queries";
import {
  ProjectForm,
  type ProjectFormValues,
} from "@/features/projects/components/CreateProjectForm";
import styles from "./CreateProject.module.scss";

export function CreateProject() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (createProject.isPending) {
      return;
    }
    setIsOpen(false);
    setError(null);
  }

  async function handleSubmit(values: ProjectFormValues) {
    setError(null);

    try {
      const project = await createProject.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      });
      setIsOpen(false);
      router.push(`/dashboard/projects/${project.id}/context`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create project."));
    }
  }

  return (
    <>
      <Button
        type="button"
        className={styles.trigger}
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
      >
        <Plus size={18} strokeWidth={2.2} />
        New Project
      </Button>

      <Modal
        open={isOpen}
        onClose={handleClose}
        title="New Project"
        closeDisabled={createProject.isPending}
      >
        <ProjectForm
          submitLabel="Create project"
          pendingLabel="Creating…"
          isSubmitting={createProject.isPending}
          error={error}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      </Modal>
    </>
  );
}
