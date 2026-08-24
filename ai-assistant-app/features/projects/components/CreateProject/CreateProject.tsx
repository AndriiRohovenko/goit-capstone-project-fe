"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { SuccessMessage } from "@/components/SuccessMessage";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateProject } from "@/features/projects/queries/projects.queries";
import {
  ProjectForm,
  type CreateProjectFormValues,
} from "@/features/projects/components/CreateProjectForm";
import styles from "./CreateProject.module.scss";

export function CreateProject() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  function handleClose() {
    if (createProject.isPending) {
      return;
    }

    const projectId = createdProjectId;
    setIsOpen(false);
    setIsFormDirty(false);
    setError(null);
    setPhase("form");
    setCreatedProjectId(null);

    if (projectId) {
      router.push(`/dashboard/projects/${projectId}/context`);
    }
  }

  async function handleSubmit(values: CreateProjectFormValues) {
    setError(null);

    try {
      const project = await createProject.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      });
      setCreatedProjectId(project.id);
      setIsFormDirty(false);
      setPhase("success");
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
          setPhase("form");
          setCreatedProjectId(null);
          setIsFormDirty(false);
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
        closeGuard={() => !isFormDirty}
      >
        {phase === "success" ? (
          <SuccessMessage
            title="Project created"
            description="Opening the project context page..."
            onClose={handleClose}
          />
        ) : (
          <ProjectForm
            submitLabel="Create project"
            pendingLabel="Creating…"
            isSubmitting={createProject.isPending}
            onDirtyChange={setIsFormDirty}
            error={error}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>
    </>
  );
}
