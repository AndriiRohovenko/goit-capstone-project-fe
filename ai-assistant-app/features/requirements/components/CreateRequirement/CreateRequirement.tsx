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
  FormSelect,
  FormTextarea,
} from "@/components/Form";
import { Modal } from "@/components/Modal";
import { SuccessMessage } from "@/components/SuccessMessage";
import { getApiErrorMessage } from "@/lib/api-error";
import { useRequirementGroups } from "@/features/requirementGroups/queries/requirementGroups.queries";
import { useCreateRequirement } from "@/features/requirements/queries/requirement.queries";
import styles from "./CreateRequirement.module.scss";

type CreateRequirementFormValues = {
  title: string;
  description: string;
  groupId: string;
  requirementType: string;
  priority: string;
  status: string;
  acceptanceCriteria: string;
  businessRules: string;
};

const emptyValues: CreateRequirementFormValues = {
  title: "",
  description: "",
  groupId: "",
  requirementType: "feature",
  priority: "medium",
  status: "draft",
  acceptanceCriteria: "",
  businessRules: "",
};

const requirementTypeOptions = [
  { value: "user_story", label: "User story" },
  { value: "feature", label: "Feature" },
  { value: "api", label: "API" },
  { value: "business_requirement", label: "Business requirement" },
  { value: "other", label: "Other" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "ready", label: "Ready" },
  { value: "analyzed", label: "Analyzed" },
  { value: "archived", label: "Archived" },
];

type CreateRequirementProps = {
  projectId: string;
};

export function CreateRequirement({ projectId }: CreateRequirementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const createRequirement = useCreateRequirement(projectId);
  const { data: requirementGroups, isPending: groupsPending } =
    useRequirementGroups(projectId);

  const groupOptions = [
    {
      value: "",
      label: groupsPending
        ? "Loading groups…"
        : requirementGroups?.length
          ? "Select a group"
          : "No groups available",
    },
    ...(requirementGroups?.map((group) => ({
      value: group.id,
      label: group.name,
    })) ?? []),
  ];

  function handleClose() {
    if (createRequirement.isPending) {
      return;
    }

    setIsOpen(false);
    setIsFormDirty(false);
    setError(null);
    setPhase("form");
  }

  async function handleSubmit(values: CreateRequirementFormValues) {
    setError(null);

    try {
      await createRequirement.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
        group_id: values.groupId,
        acceptance_criteria: splitLines(values.acceptanceCriteria),
        business_rules: splitLines(values.businessRules),
        requirement_type: values.requirementType,
        priority: values.priority,
        status: values.status,
        metadata: {
          additionalProp1: {},
        },
      });

      setIsFormDirty(false);
      setPhase("success");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create requirement."));
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
        Add Requirement
      </Button>

      <Modal
        open={isOpen}
        onClose={handleClose}
        title="Add Requirement"
        closeDisabled={createRequirement.isPending}
        closeGuard={() => !isFormDirty}
      >
        {phase === "success" ? (
          <SuccessMessage
            title="Requirement created"
            onClose={handleClose}
          />
        ) : (
          <RequirementForm
            submitLabel="Create requirement"
            pendingLabel="Creating…"
            isSubmitting={createRequirement.isPending}
            onDirtyChange={setIsFormDirty}
            groupsMissing={!requirementGroups?.length}
            groupOptions={groupOptions}
            error={error}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>
    </>
  );
}

function RequirementForm({
  submitLabel,
  pendingLabel,
  isSubmitting,
  onDirtyChange,
  groupsMissing,
  groupOptions,
  error,
  onCancel,
  onSubmit,
}: {
  submitLabel: string;
  pendingLabel: string;
  isSubmitting: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  groupsMissing: boolean;
  groupOptions: Array<{ value: string; label: string }>;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (values: CreateRequirementFormValues) => void | Promise<void>;
}) {
  return (
    <Form<CreateRequirementFormValues>
      defaultValues={emptyValues}
      onSubmit={onSubmit}
    >
      <FormDirtyStateReporter<CreateRequirementFormValues>
        onDirtyChange={onDirtyChange}
      />
      <FormField<CreateRequirementFormValues> name="title" label="Title">
        <FormInput<CreateRequirementFormValues>
          name="title"
          placeholder="e.g. User can save a draft"
          autoFocus
          disabled={isSubmitting}
          rules={{
            required: "Requirement title is required.",
            validate: (value) =>
              (typeof value === "string" && value.trim().length > 0) ||
              "Requirement title is required.",
          }}
        />
      </FormField>

      <FormField<CreateRequirementFormValues>
        name="description"
        label="Description"
      >
        <FormTextarea<CreateRequirementFormValues>
          name="description"
          placeholder="Short summary of the requirement"
          rows={3}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField<CreateRequirementFormValues> name="groupId" label="Group">
        <FormSelect<CreateRequirementFormValues>
          name="groupId"
          options={groupOptions}
          disabled={isSubmitting || groupsMissing}
          rules={{ required: "Requirement group is required." }}
        />
      </FormField>

      <FormField<CreateRequirementFormValues>
        name="requirementType"
        label="Requirement type"
      >
        <FormSelect<CreateRequirementFormValues>
          name="requirementType"
          options={requirementTypeOptions}
          disabled={isSubmitting}
          rules={{ required: "Requirement type is required." }}
        />
      </FormField>

      <FormField<CreateRequirementFormValues> name="priority" label="Priority">
        <FormSelect<CreateRequirementFormValues>
          name="priority"
          options={priorityOptions}
          disabled={isSubmitting}
          rules={{ required: "Priority is required." }}
        />
      </FormField>

      <FormField<CreateRequirementFormValues> name="status" label="Status">
        <FormSelect<CreateRequirementFormValues>
          name="status"
          options={statusOptions}
          disabled={isSubmitting}
          rules={{ required: "Status is required." }}
        />
      </FormField>

      <FormField<CreateRequirementFormValues>
        name="acceptanceCriteria"
        label="Acceptance criteria"
      >
        <FormTextarea<CreateRequirementFormValues>
          name="acceptanceCriteria"
          placeholder={"One criterion per line"}
          rows={4}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField<CreateRequirementFormValues>
        name="businessRules"
        label="Business rules"
      >
        <FormTextarea<CreateRequirementFormValues>
          name="businessRules"
          placeholder={"One rule per line"}
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
        <Button type="submit" disabled={isSubmitting || groupsMissing}>
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </FormActions>
    </Form>
  );
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}