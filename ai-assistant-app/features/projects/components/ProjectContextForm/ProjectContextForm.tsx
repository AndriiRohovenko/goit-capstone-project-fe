"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
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
  useProjectContext,
  useUpsertProjectContext,
} from "@/features/projects/queries/projects.queries";
import styles from "./ProjectContextForm.module.scss";

type ProjectContextFormValues = {
  product_description: string;
  domain: string;
  user_roles: string;
  business_rules: string;
  authentication_type: string;
  supported_platforms: string;
  additional_context: string;
};

type ProjectContextFormProps = {
  projectId: string;
};

const authTypeOptions = [
  { value: "none", label: "None" },
  { value: "session", label: "Session" },
  { value: "jwt", label: "JWT" },
  { value: "oauth2", label: "OAuth 2.0" },
  { value: "basic", label: "Basic auth" },
  { value: "api_key", label: "API key" },
];

const emptyValues: ProjectContextFormValues = {
  product_description: "",
  domain: "",
  user_roles: "",
  business_rules: "",
  authentication_type: "none",
  supported_platforms: "",
  additional_context: "{}",
};

function joinList(values: string[] | undefined) {
  return values?.length ? values.join("\n") : "";
}

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAdditionalContext(value: string): Record<string, unknown> {
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }

  const parsed: unknown = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Additional context must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

export function ProjectContextForm({ projectId }: ProjectContextFormProps) {
  const {
    data: projectContext,
    isPending,
    isError,
    error,
    refetch,
  } = useProjectContext(projectId);
  const upsertContext = useUpsertProjectContext();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isMissingContext =
    isAxiosError(error) && error.response?.status === 404;

  async function handleSubmit(values: ProjectContextFormValues) {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const additionalContext = parseAdditionalContext(
        values.additional_context,
      );

      await upsertContext.mutateAsync({
        projectId,
        payload: {
          product_description: values.product_description.trim(),
          domain: values.domain.trim(),
          user_roles: splitList(values.user_roles),
          business_rules: splitList(values.business_rules),
          authentication_type: values.authentication_type,
          supported_platforms: splitList(values.supported_platforms),
          additional_context: additionalContext,
        },
      });
      setSuccessMessage("Project context saved.");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setFormError("Additional context must be valid JSON.");
        return;
      }
      if (
        err instanceof Error &&
        err.message.includes("Additional context")
      ) {
        setFormError(err.message);
        return;
      }
      setFormError(getApiErrorMessage(err, "Failed to save project context."));
    }
  }

  if (isPending) {
    return <p className={styles.status}>Loading project context…</p>;
  }

  if (isError && !isMissingContext) {
    return (
      <div className={styles.errorState}>
        <p className={styles.error}>
          Failed to load project context
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

  const defaultValues: ProjectContextFormValues = projectContext
    ? {
        product_description: projectContext.product_description ?? "",
        domain: projectContext.domain ?? "",
        user_roles: joinList(projectContext.user_roles),
        business_rules: joinList(projectContext.business_rules),
        authentication_type: projectContext.authentication_type || "none",
        supported_platforms: joinList(projectContext.supported_platforms),
        additional_context: JSON.stringify(
          projectContext.additional_context ?? {},
          null,
          2,
        ),
      }
    : emptyValues;

  const authenticationOptions = authTypeOptions.some(
    (option) => option.value === defaultValues.authentication_type,
  )
    ? authTypeOptions
    : [
        ...authTypeOptions,
        {
          value: defaultValues.authentication_type,
          label: defaultValues.authentication_type,
        },
      ];

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Project context</h2>
        <p className={styles.subtitle}>
          Describe the product domain, roles, and platforms so AI can design
          better tests.
        </p>
      </div>

      <Form<ProjectContextFormValues>
        key={projectContext?.id ?? `new-${projectId}`}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
      >
        <FormField<ProjectContextFormValues>
          name="product_description"
          label="Product description"
        >
          <FormTextarea<ProjectContextFormValues>
            name="product_description"
            placeholder="What does this product do?"
            rows={4}
            disabled={upsertContext.isPending}
            rules={{
              required: "Product description is required.",
              validate: (value) =>
                (typeof value === "string" && value.trim().length > 0) ||
                "Product description is required.",
            }}
          />
        </FormField>

        <FormField<ProjectContextFormValues> name="domain" label="Domain">
          <FormInput<ProjectContextFormValues>
            name="domain"
            placeholder="e.g. fintech, e-commerce"
            disabled={upsertContext.isPending}
            rules={{
              required: "Domain is required.",
              validate: (value) =>
                (typeof value === "string" && value.trim().length > 0) ||
                "Domain is required.",
            }}
          />
        </FormField>

        <FormField<ProjectContextFormValues>
          name="user_roles"
          label="User roles"
        >
          <FormTextarea<ProjectContextFormValues>
            name="user_roles"
            placeholder={"One role per line, e.g.\nAdmin\nCustomer"}
            rows={3}
            disabled={upsertContext.isPending}
          />
        </FormField>

        <FormField<ProjectContextFormValues>
          name="business_rules"
          label="Business rules"
        >
          <FormTextarea<ProjectContextFormValues>
            name="business_rules"
            placeholder={"One rule per line"}
            rows={3}
            disabled={upsertContext.isPending}
          />
        </FormField>

        <FormField<ProjectContextFormValues>
          name="authentication_type"
          label="Authentication type"
        >
          <FormSelect<ProjectContextFormValues>
            name="authentication_type"
            options={authenticationOptions}
            disabled={upsertContext.isPending}
            rules={{ required: "Authentication type is required." }}
          />
        </FormField>

        <FormField<ProjectContextFormValues>
          name="supported_platforms"
          label="Supported platforms"
        >
          <FormTextarea<ProjectContextFormValues>
            name="supported_platforms"
            placeholder={"One platform per line, e.g.\nweb\nios\nandroid"}
            rows={3}
            disabled={upsertContext.isPending}
          />
        </FormField>

        <FormField<ProjectContextFormValues>
          name="additional_context"
          label="Additional context (JSON)"
        >
          <FormTextarea<ProjectContextFormValues>
            name="additional_context"
            placeholder='{"priority": "high"}'
            rows={5}
            disabled={upsertContext.isPending}
            rules={{
              validate: (value) => {
                if (typeof value !== "string") {
                  return "Additional context must be valid JSON.";
                }
                try {
                  parseAdditionalContext(value);
                  return true;
                } catch (err) {
                  return err instanceof Error
                    ? err.message
                    : "Additional context must be valid JSON.";
                }
              },
            }}
          />
        </FormField>

        <FormError message={formError} />
        {successMessage ? (
          <p className={styles.success}>{successMessage}</p>
        ) : null}

        <FormActions>
          <Button type="submit" disabled={upsertContext.isPending}>
            {upsertContext.isPending ? "Saving…" : "Save context"}
          </Button>
        </FormActions>
      </Form>
    </div>
  );
}
