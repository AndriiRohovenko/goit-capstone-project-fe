"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import {
  Form,
  FormActions,
  FormError,
  FormField,
  FormDirtyStateReporter,
  FormInput,
  FormTextarea,
} from "@/components/Form";
import { Modal } from "@/components/Modal";
import { SuccessMessage } from "@/components/SuccessMessage";
import { useCreateRequirementGroup } from "@/features/requirementGroups/queries/requirementGroups.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./addGroupForm.module.scss";

function normalizeDescription(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export type RequirementGroupFormValues = {
  name: string;
  description: string;
};

type RequirementGroupFormProps = {
  defaultValues?: Partial<RequirementGroupFormValues>;
  onSubmit: (values: RequirementGroupFormValues) => void | Promise<void>;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  submitLabel: string;
  pendingLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
};

const emptyValues: RequirementGroupFormValues = {
  name: "",
  description: "",
};

type AddGroupFormProps = {
  projectId: string;
};

export function AddGroupForm({ projectId }: AddGroupFormProps) {
  const createGroup = useCreateRequirementGroup(projectId);
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  function handleClose() {
    if (createGroup.isPending) {
      return;
    }

    setIsOpen(false);
    setIsFormDirty(false);
    setError(null);
    setPhase("form");
  }

  async function handleSubmit(values: RequirementGroupFormValues) {
    setError(null);

    try {
      await createGroup.mutateAsync({
        name: values.name.trim(),
        description: normalizeDescription(values.description),
      });
      setIsFormDirty(false);
      setPhase("success");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create requirement group."));
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
          setIsFormDirty(false);
          setIsOpen(true);
        }}
      >
        <Plus size={18} strokeWidth={2.2} />
        Add Group
      </Button>

      <Modal
        open={isOpen}
        onClose={handleClose}
        title="Add Requirement Group"
        closeDisabled={createGroup.isPending}
        closeGuard={() => !isFormDirty}
      >
        {phase === "success" ? (
          <SuccessMessage title="Group created" onClose={handleClose} />
        ) : (
          <RequirementGroupForm
            submitLabel="Create group"
            pendingLabel="Creating..."
            isSubmitting={createGroup.isPending}
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

export function RequirementGroupForm({
  defaultValues,
  onSubmit,
  onCancel,
  onDirtyChange,
  submitLabel,
  pendingLabel = "Saving...",
  isSubmitting = false,
  error,
}: RequirementGroupFormProps) {
  return (
    <Form<RequirementGroupFormValues>
      defaultValues={{ ...emptyValues, ...defaultValues }}
      onSubmit={onSubmit}
    >
      <FormDirtyStateReporter<RequirementGroupFormValues>
        onDirtyChange={onDirtyChange}
      />
      <FormField<RequirementGroupFormValues> name="name" label="Group Name">
        <FormInput<RequirementGroupFormValues>
          name="name"
          placeholder="Enter group name"
          autoFocus
          disabled={isSubmitting}
          rules={{
            required: "Group name is required.",
            validate: (value) =>
              (typeof value === "string" && value.trim().length > 0) ||
              "Group name is required.",
          }}
        />
      </FormField>

      <FormField<RequirementGroupFormValues>
        name="description"
        label="Description"
      >
        <FormTextarea<RequirementGroupFormValues>
          name="description"
          placeholder="Enter description (optional)"
          rows={4}
          disabled={isSubmitting}
        />
      </FormField>

      <FormError message={error} />

      <FormActions>
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </FormActions>
    </Form>
  );
}