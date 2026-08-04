"use client";

import { Button } from "@/components/Button";
import {
  Form,
  FormActions,
  FormError,
  FormField,
  FormInput,
  FormTextarea,
} from "@/components/Form";

export type CreateProjectFormValues = {
  name: string;
  description: string;
};

type CreateProjectFormProps = {
  defaultValues?: Partial<CreateProjectFormValues>;
  onSubmit: (values: CreateProjectFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
  pendingLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
};

const emptyValues: CreateProjectFormValues = {
  name: "",
  description: "",
};

export function ProjectForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  pendingLabel = "Saving…",
  isSubmitting = false,
  error,
}: CreateProjectFormProps) {
  return (
    <Form<CreateProjectFormValues>
      defaultValues={{ ...emptyValues, ...defaultValues }}
      onSubmit={onSubmit}
    >
      <FormField<CreateProjectFormValues> name="name" label="Name">
        <FormInput<CreateProjectFormValues>
          name="name"
          placeholder="e.g. InvestingLibrary"
          autoFocus
          disabled={isSubmitting}
          rules={{
            required: "Project name is required.",
            validate: (value) =>
              (typeof value === "string" && value.trim().length > 0) ||
              "Project name is required.",
          }}
        />
      </FormField>

      <FormField<CreateProjectFormValues>
        name="description"
        label="Description"
      >
        <FormTextarea<CreateProjectFormValues>
          name="description"
          placeholder="Optional short summary"
          rows={3}
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
