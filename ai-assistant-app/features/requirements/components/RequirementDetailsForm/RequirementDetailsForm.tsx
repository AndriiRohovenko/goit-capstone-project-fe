"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import {
  Form,
  FormActions,
  FormError,
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/Form";
import { useUpdateRequirement } from "@/features/requirements/queries/requirement.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Requirement, RequirementPayload } from "@/types/requirement";
import type { RequirementGroup } from "@/types/requirementGroup";
import styles from "./RequirementDetailsForm.module.scss";

type RequirementDetailsFormProps = {
  projectId: string;
  requirement: Requirement;
  groups?: RequirementGroup[];
};

type RequirementDetailsFormValues = {
  group_id: string;
  requirement_type: string;
  priority: string;
  status: string;
  description: string;
  acceptance_criteria: string;
  business_rules: string;
};

type RequirementTab = "details" | "artifacts" | "test_coverage";

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

export function RequirementDetailsForm({
  projectId,
  requirement,
  groups,
}: RequirementDetailsFormProps) {
  const updateRequirement = useUpdateRequirement(projectId, requirement.id);
  const [activeTab, setActiveTab] = useState<RequirementTab>("details");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const payloadBase = useMemo(() => toRequirementPayload(requirement), [requirement]);

  const groupOptions = useMemo(() => {
    const baseOptions =
      groups?.map((group) => ({ value: group.id, label: group.name })) ?? [];

    if (!baseOptions.some((option) => option.value === requirement.group_id)) {
      baseOptions.push({
        value: requirement.group_id,
        label: requirement.group_id ? "Current group" : "No group",
      });
    }

    return baseOptions;
  }, [groups, requirement.group_id]);

  const defaultValues: RequirementDetailsFormValues = useMemo(
    () => ({
      group_id: requirement.group_id,
      requirement_type: requirement.requirement_type || "feature",
      priority: requirement.priority || "medium",
      status: requirement.status || "draft",
      description: requirement.description ?? "",
      acceptance_criteria: joinLines(requirement.acceptance_criteria),
      business_rules: joinLines(requirement.business_rules),
    }),
    [requirement],
  );

  async function handleSubmit(values: RequirementDetailsFormValues) {
    setFormError(null);
    setSuccessMessage(null);

    const nextPayload: RequirementPayload = {
      ...payloadBase,
      group_id: values.group_id,
      requirement_type: values.requirement_type,
      priority: values.priority,
      status: values.status,
      description: values.description.trim(),
      acceptance_criteria: splitLines(values.acceptance_criteria),
      business_rules: splitLines(values.business_rules),
    };

    try {
      await updateRequirement.mutateAsync(nextPayload);
      setSuccessMessage("Details updated.");
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Failed to update requirement."));
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "details" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "artifacts" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("artifacts")}
        >
          Artifacts
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "test_coverage" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("test_coverage")}
        >
          Test Coverage
        </button>
      </div>

      {activeTab === "details" ? (
        <Form<RequirementDetailsFormValues>
          key={requirement.updated_at}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
        >
          <section className={styles.section}>
            <FormField<RequirementDetailsFormValues> name="group_id" label="Group">
              <FormSelect<RequirementDetailsFormValues>
                name="group_id"
                options={groupOptions}
                disabled={updateRequirement.isPending}
              />
            </FormField>

            <FormField<RequirementDetailsFormValues>
              name="requirement_type"
              label="Requirement Type"
            >
              <FormSelect<RequirementDetailsFormValues>
                name="requirement_type"
                options={ensureOption(requirementTypeOptions, defaultValues.requirement_type)}
                disabled={updateRequirement.isPending}
              />
            </FormField>

            <FormField<RequirementDetailsFormValues> name="priority" label="Priority">
              <FormSelect<RequirementDetailsFormValues>
                name="priority"
                options={ensureOption(priorityOptions, defaultValues.priority)}
                disabled={updateRequirement.isPending}
              />
            </FormField>

            <FormField<RequirementDetailsFormValues> name="status" label="Status">
              <FormSelect<RequirementDetailsFormValues>
                name="status"
                options={ensureOption(statusOptions, defaultValues.status)}
                disabled={updateRequirement.isPending}
              />
            </FormField>
          </section>

          <section className={styles.section}>
            <FormField<RequirementDetailsFormValues>
              name="description"
              label="Description"
            >
              <FormTextarea<RequirementDetailsFormValues>
                name="description"
                rows={4}
                placeholder="Describe the requirement"
                disabled={updateRequirement.isPending}
              />
            </FormField>
          </section>

          <section className={styles.section}>
            <FormField<RequirementDetailsFormValues>
              name="acceptance_criteria"
              label="Acceptance Criteria"
            >
              <FormTextarea<RequirementDetailsFormValues>
                name="acceptance_criteria"
                rows={5}
                placeholder="One criterion per line"
                disabled={updateRequirement.isPending}
              />
            </FormField>
          </section>

          <section className={styles.section}>
            <FormField<RequirementDetailsFormValues>
              name="business_rules"
              label="Business Rules"
            >
              <FormTextarea<RequirementDetailsFormValues>
                name="business_rules"
                rows={5}
                placeholder="One rule per line"
                disabled={updateRequirement.isPending}
              />
            </FormField>
          </section>

          <section className={styles.section}>
            <FormActions>
              <Button type="submit" disabled={updateRequirement.isPending}>
                {updateRequirement.isPending ? "Saving..." : "Update details"}
              </Button>
            </FormActions>
          </section>

          <FormError message={formError} />
          {successMessage ? <p className={styles.success}>{successMessage}</p> : null}
        </Form>
      ) : (
        <section className={styles.section}>
          <p className={styles.mockedMessage}>
            {activeTab === "artifacts"
              ? "Artifacts section is coming soon."
              : "Test Coverage section is coming soon."}
          </p>
        </section>
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

function ensureOption(
  options: Array<{ value: string; label: string }>,
  value: string,
) {
  if (!value) {
    return options;
  }

  if (options.some((option) => option.value === value)) {
    return options;
  }

  return [
    ...options,
    {
      value,
      label: value,
    },
  ];
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