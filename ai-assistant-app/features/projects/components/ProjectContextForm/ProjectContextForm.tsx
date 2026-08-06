"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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
  useUpdateProjectContext,
} from "@/features/projects/queries/projects.queries";
import type { UpdateProjectContextPayload } from "@/types/project";
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

type ContextFieldKey =
  | "product_description"
  | "domain"
  | "user_roles"
  | "business_rules"
  | "authentication_type"
  | "supported_platforms"
  | "additional_context";

type TextFormValues = {
  value: string;
};

type SelectFormValues = {
  value: string;
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
  const updateContext = useUpdateProjectContext();
  const [editingField, setEditingField] = useState<ContextFieldKey | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isMissingContext =
    isAxiosError(error) && error.response?.status === 404;

  async function handleSubmitField(
    field: ContextFieldKey,
    value: string,
  ) {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateProjectContextPayload = {};

      if (field === "product_description") {
        payload.product_description = value.trim();
      }
      if (field === "domain") {
        payload.domain = value.trim();
      }
      if (field === "user_roles") {
        payload.user_roles = splitList(value);
      }
      if (field === "business_rules") {
        payload.business_rules = splitList(value);
      }
      if (field === "authentication_type") {
        payload.authentication_type = value;
      }
      if (field === "supported_platforms") {
        payload.supported_platforms = splitList(value);
      }
      if (field === "additional_context") {
        payload.additional_context = parseAdditionalContext(value);
      }

      await updateContext.mutateAsync({
        projectId,
        payload,
      });
      setEditingField(null);
      setSuccessMessage("Project context updated.");
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

      <EditableTextContextSection
        title="Product description"
        value={defaultValues.product_description}
        placeholder="What does this product do?"
        rows={4}
        isEditing={editingField === "product_description"}
        canEdit={editingField === null || editingField === "product_description"}
        pending={updateContext.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingField("product_description");
        }}
        onCancel={() => {
          if (!updateContext.isPending) {
            setEditingField(null);
          }
        }}
        onSubmit={(value) => handleSubmitField("product_description", value)}
      />

      <EditableInputContextSection
        title="Domain"
        value={defaultValues.domain}
        placeholder="e.g. fintech, e-commerce"
        isEditing={editingField === "domain"}
        canEdit={editingField === null || editingField === "domain"}
        pending={updateContext.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingField("domain");
        }}
        onCancel={() => {
          if (!updateContext.isPending) {
            setEditingField(null);
          }
        }}
        onSubmit={(value) => handleSubmitField("domain", value)}
      />

      <EditableTextContextSection
        title="User roles"
        value={defaultValues.user_roles}
        placeholder={"One role per line"}
        rows={3}
        asList
        isEditing={editingField === "user_roles"}
        canEdit={editingField === null || editingField === "user_roles"}
        pending={updateContext.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingField("user_roles");
        }}
        onCancel={() => {
          if (!updateContext.isPending) {
            setEditingField(null);
          }
        }}
        onSubmit={(value) => handleSubmitField("user_roles", value)}
      />

      <EditableTextContextSection
        title="Business rules"
        value={defaultValues.business_rules}
        placeholder={"One rule per line"}
        rows={3}
        asList
        isEditing={editingField === "business_rules"}
        canEdit={editingField === null || editingField === "business_rules"}
        pending={updateContext.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingField("business_rules");
        }}
        onCancel={() => {
          if (!updateContext.isPending) {
            setEditingField(null);
          }
        }}
        onSubmit={(value) => handleSubmitField("business_rules", value)}
      />

      <EditableSelectContextSection
        title="Authentication type"
        value={defaultValues.authentication_type}
        options={authenticationOptions}
        isEditing={editingField === "authentication_type"}
        canEdit={editingField === null || editingField === "authentication_type"}
        pending={updateContext.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingField("authentication_type");
        }}
        onCancel={() => {
          if (!updateContext.isPending) {
            setEditingField(null);
          }
        }}
        onSubmit={(value) => handleSubmitField("authentication_type", value)}
      />

      <EditableTextContextSection
        title="Supported platforms"
        value={defaultValues.supported_platforms}
        placeholder={"One platform per line"}
        rows={3}
        asList
        isEditing={editingField === "supported_platforms"}
        canEdit={editingField === null || editingField === "supported_platforms"}
        pending={updateContext.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingField("supported_platforms");
        }}
        onCancel={() => {
          if (!updateContext.isPending) {
            setEditingField(null);
          }
        }}
        onSubmit={(value) => handleSubmitField("supported_platforms", value)}
      />

      <EditableTextContextSection
        title="Additional context (JSON)"
        value={defaultValues.additional_context}
        placeholder='{"priority": "high"}'
        rows={5}
        isEditing={editingField === "additional_context"}
        canEdit={editingField === null || editingField === "additional_context"}
        pending={updateContext.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingField("additional_context");
        }}
        onCancel={() => {
          if (!updateContext.isPending) {
            setEditingField(null);
          }
        }}
        onSubmit={(value) => handleSubmitField("additional_context", value)}
      />

      <FormError message={formError} />
      {successMessage ? <p className={styles.success}>{successMessage}</p> : null}
    </div>
  );
}

function EditableTextContextSection({
  title,
  value,
  placeholder,
  rows,
  asList = false,
  isEditing,
  canEdit,
  pending,
  onEdit,
  onCancel,
  onSubmit,
}: {
  title: string;
  value: string;
  placeholder: string;
  rows: number;
  asList?: boolean;
  isEditing: boolean;
  canEdit: boolean;
  pending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (value: string) => void | Promise<void>;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {!isEditing ? (
          <button
            type="button"
            className={styles.editButton}
            onClick={onEdit}
            disabled={!canEdit || pending}
          >
            <Pencil size={14} strokeWidth={2} />
            Edit
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <Form<TextFormValues>
          defaultValues={{ value }}
          onSubmit={({ value: nextValue }) => onSubmit(nextValue)}
        >
          <FormField<TextFormValues> name="value" label={title}>
            <FormTextarea<TextFormValues>
              name="value"
              placeholder={placeholder}
              rows={rows}
              disabled={pending}
            />
          </FormField>

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </FormActions>
        </Form>
      ) : asList ? (
        value.trim() ? (
          <ul className={styles.listValue}>
            {value
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, index) => (
                <li key={`${title}-${index}`}>{line}</li>
              ))}
          </ul>
        ) : (
          <p className={styles.textValue}>No value yet.</p>
        )
      ) : (
        <p className={styles.textValue}>{value || "No value yet."}</p>
      )}
    </section>
  );
}

function EditableInputContextSection({
  title,
  value,
  placeholder,
  isEditing,
  canEdit,
  pending,
  onEdit,
  onCancel,
  onSubmit,
}: {
  title: string;
  value: string;
  placeholder: string;
  isEditing: boolean;
  canEdit: boolean;
  pending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (value: string) => void | Promise<void>;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {!isEditing ? (
          <button
            type="button"
            className={styles.editButton}
            onClick={onEdit}
            disabled={!canEdit || pending}
          >
            <Pencil size={14} strokeWidth={2} />
            Edit
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <Form<TextFormValues>
          defaultValues={{ value }}
          onSubmit={({ value: nextValue }) => onSubmit(nextValue)}
        >
          <FormField<TextFormValues> name="value" label={title}>
            <FormInput<TextFormValues>
              name="value"
              placeholder={placeholder}
              disabled={pending}
            />
          </FormField>

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </FormActions>
        </Form>
      ) : (
        <p className={styles.textValue}>{value || "No value yet."}</p>
      )}
    </section>
  );
}

function EditableSelectContextSection({
  title,
  value,
  options,
  isEditing,
  canEdit,
  pending,
  onEdit,
  onCancel,
  onSubmit,
}: {
  title: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  isEditing: boolean;
  canEdit: boolean;
  pending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (value: string) => void | Promise<void>;
}) {
  const currentLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {!isEditing ? (
          <button
            type="button"
            className={styles.editButton}
            onClick={onEdit}
            disabled={!canEdit || pending}
          >
            <Pencil size={14} strokeWidth={2} />
            Edit
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <Form<SelectFormValues>
          defaultValues={{ value }}
          onSubmit={({ value: nextValue }) => onSubmit(nextValue)}
        >
          <FormField<SelectFormValues> name="value" label={title}>
            <FormSelect<SelectFormValues>
              name="value"
              options={options}
              disabled={pending}
            />
          </FormField>

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </FormActions>
        </Form>
      ) : (
        <p className={styles.textValue}>{currentLabel || "No value yet."}</p>
      )}
    </section>
  );
}
