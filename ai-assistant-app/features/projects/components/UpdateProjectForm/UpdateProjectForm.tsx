"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import {
  Form,
  FormActions,
  FormError,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/Form";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useProject,
  useUpdateProject,
} from "@/features/projects/queries/projects.queries";
import type { ProjectStatus } from "@/types/project";
import styles from "./UpdateProjectForm.module.scss";

type UpdateProjectFormValues = {
  name: string;
  description: string;
  status: ProjectStatus;
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

type UpdateProjectFormProps = {
  projectId: string;
  onSuccess?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

export function UpdateProjectForm({
  projectId,
  onSuccess,
  onSubmittingChange,
}: UpdateProjectFormProps) {
  const {
    data: project,
    isPending,
    isError,
    error,
    refetch,
  } = useProject(projectId);
  const updateProject = useUpdateProject();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(values: UpdateProjectFormValues) {
    setFormError(null);
    onSubmittingChange?.(true);

    try {
      await updateProject.mutateAsync({
        projectId,
        payload: {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          status: values.status,
        },
      });
      onSubmittingChange?.(false);
      onSuccess?.();
    } catch (err) {
      onSubmittingChange?.(false);
      setFormError(getApiErrorMessage(err, "Failed to update project."));
    }
  }

  if (isPending) {
    return <p className={styles.status}>Loading project…</p>;
  }

  if (isError || !project) {
    return (
      <div className={styles.errorState}>
        <p className={styles.error}>
          Failed to load project
          {error instanceof Error ? `: ${error.message}` : "."}
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Project details</h2>
        <p className={styles.subtitle}>
          Update the base information for this project.
        </p>
      </div>

      <Form<UpdateProjectFormValues>
        key={project.id}
        defaultValues={{
          name: project.name,
          description: project.description ?? "",
          status: project.status ?? "draft",
        }}
        onSubmit={handleSubmit}
      >
        <FormField<UpdateProjectFormValues> name="name" label="Name">
          <FormInput<UpdateProjectFormValues>
            name="name"
            placeholder="e.g. Checkout Flow"
            disabled={updateProject.isPending}
            rules={{
              required: "Project name is required.",
              validate: (value) =>
                (typeof value === "string" && value.trim().length > 0) ||
                "Project name is required.",
            }}
          />
        </FormField>

        <FormField<UpdateProjectFormValues>
          name="description"
          label="Description"
        >
          <FormTextarea<UpdateProjectFormValues>
            name="description"
            placeholder="Optional short summary"
            rows={4}
            disabled={updateProject.isPending}
          />
        </FormField>

        <FormField<UpdateProjectFormValues> name="status" label="Status">
          <FormSelect<UpdateProjectFormValues>
            name="status"
            options={statusOptions}
            disabled={updateProject.isPending}
            rules={{ required: "Status is required." }}
          />
        </FormField>

        <FormError message={formError} />

        <FormActions>
          <Button type="submit" disabled={updateProject.isPending}>
            {updateProject.isPending ? "Saving…" : "Save changes"}
          </Button>
        </FormActions>
      </Form>
    </div>
  );
}
