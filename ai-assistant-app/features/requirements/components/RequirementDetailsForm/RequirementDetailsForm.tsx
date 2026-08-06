"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/Button";
import {
  Form,
  FormActions,
  FormError,
  FormField,
  FormTextarea,
} from "@/components/Form";
import { useUpdateRequirement } from "@/features/requirements/queries/requirement.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Requirement, RequirementPayload } from "@/types/requirement";
import styles from "./RequirementDetailsForm.module.scss";

type RequirementDetailsFormProps = {
  projectId: string;
  requirement: Requirement;
};

type DetailSection = "description" | "acceptance" | "rules";

type TextFieldFormValues = {
  value: string;
};

export function RequirementDetailsForm({
  projectId,
  requirement,
}: RequirementDetailsFormProps) {
  const updateRequirement = useUpdateRequirement(projectId, requirement.id);
  const [editingSection, setEditingSection] = useState<DetailSection | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const payloadBase = useMemo(() => toRequirementPayload(requirement), [requirement]);

  async function updateSection(section: DetailSection, value: string) {
    setFormError(null);
    setSuccessMessage(null);

    const nextPayload: RequirementPayload = {
      ...payloadBase,
    };

    if (section === "description") {
      nextPayload.description = value.trim();
    }

    if (section === "acceptance") {
      nextPayload.acceptance_criteria = splitLines(value);
    }

    if (section === "rules") {
      nextPayload.business_rules = splitLines(value);
    }

    try {
      await updateRequirement.mutateAsync(nextPayload);
      setEditingSection(null);
      setSuccessMessage("Details updated.");
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Failed to update requirement."));
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${styles.tabActive}`}>
          Details
        </button>
      </div>

      <EditableTextSection
        title="Description"
        text={requirement.description?.trim() || "No description yet."}
        isEditing={editingSection === "description"}
        canEdit={editingSection === null || editingSection === "description"}
        pending={updateRequirement.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingSection("description");
        }}
        onCancel={() => {
          if (updateRequirement.isPending) {
            return;
          }
          setEditingSection(null);
          setFormError(null);
        }}
        defaultValue={requirement.description ?? ""}
        placeholder="Describe the requirement"
        onSubmit={(value) => updateSection("description", value)}
      />

      <EditableTextSection
        title="Acceptance Criteria"
        text={displayList(requirement.acceptance_criteria)}
        isList
        isEditing={editingSection === "acceptance"}
        canEdit={editingSection === null || editingSection === "acceptance"}
        pending={updateRequirement.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingSection("acceptance");
        }}
        onCancel={() => {
          if (updateRequirement.isPending) {
            return;
          }
          setEditingSection(null);
          setFormError(null);
        }}
        defaultValue={joinLines(requirement.acceptance_criteria)}
        placeholder="One criterion per line"
        onSubmit={(value) => updateSection("acceptance", value)}
      />

      <EditableTextSection
        title="Business Rules"
        text={displayList(requirement.business_rules)}
        isList
        isEditing={editingSection === "rules"}
        canEdit={editingSection === null || editingSection === "rules"}
        pending={updateRequirement.isPending}
        onEdit={() => {
          setFormError(null);
          setSuccessMessage(null);
          setEditingSection("rules");
        }}
        onCancel={() => {
          if (updateRequirement.isPending) {
            return;
          }
          setEditingSection(null);
          setFormError(null);
        }}
        defaultValue={joinLines(requirement.business_rules)}
        placeholder="One rule per line"
        onSubmit={(value) => updateSection("rules", value)}
      />

      <FormError message={formError} />
      {successMessage ? <p className={styles.success}>{successMessage}</p> : null}
    </section>
  );
}

function EditableTextSection({
  title,
  text,
  isEditing,
  canEdit,
  pending,
  isList = false,
  defaultValue,
  placeholder,
  onEdit,
  onCancel,
  onSubmit,
}: {
  title: string;
  text: string;
  isEditing: boolean;
  canEdit: boolean;
  pending: boolean;
  isList?: boolean;
  defaultValue: string;
  placeholder: string;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (value: string) => void | Promise<void>;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
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
        <Form<TextFieldFormValues>
          defaultValues={{ value: defaultValue }}
          onSubmit={({ value }) => onSubmit(value)}
        >
          <FormField<TextFieldFormValues> name="value" label={title}>
            <FormTextarea<TextFieldFormValues>
              name="value"
              rows={isList ? 5 : 4}
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
      ) : isList ? (
        <ul className={styles.list}>
          {text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line, index) => (
              <li key={`${title}-${index}`} className={styles.listItem}>
                {line}
              </li>
            ))}
        </ul>
      ) : (
        <p className={styles.paragraph}>{text}</p>
      )}
    </section>
  );
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(values: string[] | undefined, separator = "\n"): string {
  return values?.length ? values.join(separator) : "";
}

function displayList(values: string[] | undefined): string {
  if (!values?.length) {
    return "No entries yet.";
  }

  return values.join("\n");
}

function toRequirementPayload(requirement: Requirement): RequirementPayload {
  return {
    title: requirement.title,
    description: requirement.description ?? "",
    group_id: requirement.group_id,
    acceptance_criteria: requirement.acceptance_criteria ?? [],
    business_rules: requirement.business_rules ?? [],
    requirement_type: requirement.requirement_type || "feature",
    priority: requirement.priority || "medium",
    status: requirement.status || "draft",
    metadata: requirement.metadata ?? {
      additionalProp1: {},
    },
  };
}