"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  FileCheck2,
  ListChecks,
  Plus,
  Route,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import {
  useArtifacts,
  useRegenerateArtifact,
  useUpdateArtifact,
} from "@/features/artifacts/queries/artifacts.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ArtifactType } from "@/types/artifacts";
import styles from "./requirementArtifactsTab.module.scss";

type RequirementArtifactsTabProps = {
  projectId: string;
  requirementId: string;
};

type TestCaseItem = {
  title: string;
  priority: string;
  steps: string[];
  expectedResult: string;
};

type ScenarioItem = {
  title: string;
  expectedResult: string;
};

type ArtifactDraft = {
  testCases: TestCaseItem[];
  checklist: string[];
  scenarios: ScenarioItem[];
  recommendations: string[];
};

const ARTIFACT_ORDER: ArtifactType[] = [
  "test_cases",
  "checklist",
  "negative_scenarios",
  "edge_cases",
  "automation_recommendations",
];

const EXCLUDED_ARTIFACT_TYPES: ArtifactType[] = ["requirement_review"];

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  test_cases: "Test Cases",
  checklist: "Checklist",
  negative_scenarios: "Negative Scenarios",
  edge_cases: "Edge Cases",
  requirement_review: "Requirement Review",
  automation_recommendations: "Automation Recommendations",
};

const ARTIFACT_DESCRIPTIONS: Record<ArtifactType, string> = {
  test_cases: "Detailed test cases with steps and expected results.",
  checklist: "Key verification points and a quick testing checklist.",
  negative_scenarios: "Failure scenarios and error-condition testing.",
  edge_cases: "Boundary conditions and uncommon system paths.",
  requirement_review: "AI review of clarity, completeness, and quality.",
  automation_recommendations:
    "Recommendations for automation and tooling strategy.",
};

export function RequirementArtifactsTab({
  projectId,
  requirementId,
}: RequirementArtifactsTabProps) {
  const [selectedArtifactType, setSelectedArtifactType] =
    useState<ArtifactType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draft, setDraft] = useState<ArtifactDraft | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const artifacts = useArtifacts(projectId, requirementId);
  const updateArtifact = useUpdateArtifact();
  const regenerateArtifact = useRegenerateArtifact();

  const sortedArtifacts = useMemo(() => {
    const list = (artifacts.data ?? []).filter(
      (artifact) => !EXCLUDED_ARTIFACT_TYPES.includes(artifact.artifact_type),
    );

    return [...list].sort((a, b) => {
      const left = ARTIFACT_ORDER.indexOf(a.artifact_type);
      const right = ARTIFACT_ORDER.indexOf(b.artifact_type);

      if (left === -1 || right === -1) {
        return a.artifact_type.localeCompare(b.artifact_type);
      }

      return left - right;
    });
  }, [artifacts.data]);

  const selectedArtifact = useMemo(
    () =>
      selectedArtifactType
        ? sortedArtifacts.find(
            (artifact) => artifact.artifact_type === selectedArtifactType,
          )
        : null,
    [selectedArtifactType, sortedArtifacts],
  );

  const isMutating = updateArtifact.isPending || regenerateArtifact.isPending;

  function openArtifact(artifactType: ArtifactType) {
    setActionError(null);
    setIsEditMode(false);
    setDraft(null);
    setSelectedArtifactType(artifactType);
  }

  function closeModal() {
    if (isMutating) {
      return;
    }

    setActionError(null);
    setIsEditMode(false);
    setDraft(null);
    setSelectedArtifactType(null);
  }

  function startEdit() {
    if (!selectedArtifact) {
      return;
    }

    setActionError(null);
    setDraft(
      createDraft(selectedArtifact.artifact_type, selectedArtifact.content),
    );
    setIsEditMode(true);
  }

  function cancelEdit() {
    setActionError(null);
    setIsEditMode(false);
    setDraft(
      selectedArtifact
        ? createDraft(selectedArtifact.artifact_type, selectedArtifact.content)
        : null,
    );
  }

  async function handleSaveDraft() {
    if (!selectedArtifact || !draft) {
      return;
    }

    setActionError(null);

    try {
      await updateArtifact.mutateAsync({
        projectId,
        requirementId,
        artifactType: selectedArtifact.artifact_type,
        payload: {
          content: serializeDraft(selectedArtifact.artifact_type, draft),
        },
      });
      setIsEditMode(false);
      setActionError(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update artifact."));
    }
  }

  async function handleRegenerate() {
    if (!selectedArtifact) {
      return;
    }

    setActionError(null);

    try {
      await regenerateArtifact.mutateAsync({
        projectId,
        requirementId,
        artifactType: selectedArtifact.artifact_type,
      });
      setActionError(null);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to regenerate artifact."),
      );
    }
  }

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Test Artifacts</h3>
        </div>
        <p className={styles.subtitle}>
          AI-generated artifacts to help validate and test this requirement.
        </p>

        {artifacts.isPending ? (
          <p className={styles.empty}>Loading artifacts...</p>
        ) : sortedArtifacts.length ? (
          <ul className={styles.list}>
            {sortedArtifacts.map((artifact) => (
              <li key={artifact.id} className={styles.item}>
                <button
                  type="button"
                  className={styles.itemButton}
                  onClick={() => openArtifact(artifact.artifact_type)}
                >
                  <div className={styles.iconWrap}>
                    {artifactIcon(artifact.artifact_type)}
                  </div>

                  <div className={styles.itemCopy}>
                    <p className={styles.itemTitle}>
                      {artifactLabel(artifact.artifact_type)}
                    </p>
                    <p className={styles.itemDescription}>
                      {artifactDescription(artifact.artifact_type)}
                    </p>
                  </div>

                  <div className={styles.itemMeta}>
                    <span className={styles.stateBadge}>
                      {artifact.is_edited ? "Edited" : "Auto-generated"}
                    </span>
                    <span className={styles.metaBadge}>
                      {contentSummary(artifact.content)}
                    </span>
                    <span className={styles.metaDate}>
                      Updated {formatDate(artifact.updated_at)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            No artifacts generated yet. Use the generator in AI Requirement
            Analysis.
          </p>
        )}
      </div>

      <Modal
        open={Boolean(selectedArtifact)}
        onClose={closeModal}
        title={
          selectedArtifact
            ? artifactLabel(selectedArtifact.artifact_type)
            : "Artifact"
        }
        closeDisabled={isMutating}
      >
        {selectedArtifact ? (
          <div className={styles.modalBody}>
            <p className={styles.modalSubtitle}>
              {isEditMode
                ? "Edit artifact fields and save your changes."
                : "Preview generated artifact content. Use Edit to unlock fields."}
            </p>

            {isEditMode ? (
              <ArtifactEditor
                artifactType={selectedArtifact.artifact_type}
                draft={draft}
                disabled={isMutating}
                onDraftChange={setDraft}
              />
            ) : (
              <section className={styles.previewBlock}>
                <h4 className={styles.previewTitle}>Artifact Content</h4>
                <ArtifactPreview
                  artifactType={selectedArtifact.artifact_type}
                  content={selectedArtifact.content}
                />
              </section>
            )}

            <div className={styles.modalActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleRegenerate()}
                disabled={isMutating}
              >
                {regenerateArtifact.isPending
                  ? "Regenerating..."
                  : "Regenerate"}
              </Button>

              {isEditMode ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={cancelEdit}
                    disabled={isMutating}
                  >
                    Cancel Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSaveDraft()}
                    disabled={isMutating}
                  >
                    {updateArtifact.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={startEdit}
                  disabled={isMutating}
                >
                  Edit
                </Button>
              )}

              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={isMutating}
              >
                Close
              </Button>
            </div>

            {actionError ? <p className={styles.error}>{actionError}</p> : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}

function ArtifactEditor({
  artifactType,
  draft,
  disabled,
  onDraftChange,
}: {
  artifactType: ArtifactType;
  draft: ArtifactDraft | null;
  disabled: boolean;
  onDraftChange: (next: ArtifactDraft | null) => void;
}) {
  if (!draft) {
    return <p className={styles.empty}>Editor is not ready.</p>;
  }

  if (artifactType === "test_cases") {
    return (
      <TestCasesEditor
        value={draft.testCases}
        disabled={disabled}
        onChange={(next) => onDraftChange({ ...draft, testCases: next })}
      />
    );
  }

  if (artifactType === "checklist") {
    return (
      <StringListEditor
        title="Checklist"
        label="Checklist items"
        value={draft.checklist}
        disabled={disabled}
        onChange={(next) => onDraftChange({ ...draft, checklist: next })}
      />
    );
  }

  if (artifactType === "negative_scenarios" || artifactType === "edge_cases") {
    return (
      <ScenariosEditor
        title={
          artifactType === "edge_cases" ? "Edge Cases" : "Negative Scenarios"
        }
        value={draft.scenarios}
        disabled={disabled}
        onChange={(next) => onDraftChange({ ...draft, scenarios: next })}
      />
    );
  }

  if (artifactType === "automation_recommendations") {
    return (
      <StringListEditor
        title="Automation Recommendations"
        label="Recommendations"
        value={draft.recommendations}
        disabled={disabled}
        onChange={(next) => onDraftChange({ ...draft, recommendations: next })}
      />
    );
  }

  return <p className={styles.empty}>This artifact type is read-only.</p>;
}

function TestCasesEditor({
  value,
  disabled,
  onChange,
}: {
  value: TestCaseItem[];
  disabled: boolean;
  onChange: (next: TestCaseItem[]) => void;
}) {
  function updateCase(index: number, nextCase: TestCaseItem) {
    onChange(
      value.map((item, itemIndex) => (itemIndex === index ? nextCase : item)),
    );
  }

  function removeCase(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function addCase() {
    onChange([
      ...value,
      {
        title: "New test case",
        priority: "medium",
        steps: [""],
        expectedResult: "",
      },
    ]);
  }

  return (
    <div className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <h4 className={styles.editorTitle}>Test Cases</h4>
        <Button
          type="button"
          variant="secondary"
          onClick={addCase}
          disabled={disabled}
        >
          <Plus size={14} />
          Add Case
        </Button>
      </div>

      {value.length ? (
        <div className={styles.editorCards}>
          {value.map((testCase, index) => (
            <div key={index} className={styles.editorCard}>
              <div className={styles.editorHeaderInline}>
                <p className={styles.editorCardTitle}>Case {index + 1}</p>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => removeCase(index)}
                  disabled={disabled}
                  aria-label={`Remove case ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <label className={styles.editorField}>
                <span className={styles.editorLabel}>Title</span>
                <input
                  className={styles.editorInput}
                  value={testCase.title}
                  onChange={(event) =>
                    updateCase(index, {
                      ...testCase,
                      title: event.target.value,
                    })
                  }
                  disabled={disabled}
                />
              </label>

              <label className={styles.editorField}>
                <span className={styles.editorLabel}>Priority</span>
                <select
                  className={styles.editorSelect}
                  value={testCase.priority || "medium"}
                  onChange={(event) =>
                    updateCase(index, {
                      ...testCase,
                      priority: event.target.value,
                    })
                  }
                  disabled={disabled}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>

              <label className={styles.editorField}>
                <span className={styles.editorLabel}>Steps (one per line)</span>
                <textarea
                  className={styles.editorTextarea}
                  rows={5}
                  value={testCase.steps.join("\n")}
                  onChange={(event) =>
                    updateCase(index, {
                      ...testCase,
                      steps: splitLines(event.target.value),
                    })
                  }
                  disabled={disabled}
                />
              </label>

              <label className={styles.editorField}>
                <span className={styles.editorLabel}>Expected Result</span>
                <textarea
                  className={styles.editorTextarea}
                  rows={3}
                  value={testCase.expectedResult}
                  onChange={(event) =>
                    updateCase(index, {
                      ...testCase,
                      expectedResult: event.target.value,
                    })
                  }
                  disabled={disabled}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No test cases. Click Add Case.</p>
      )}
    </div>
  );
}

function ScenariosEditor({
  title,
  value,
  disabled,
  onChange,
}: {
  title: string;
  value: ScenarioItem[];
  disabled: boolean;
  onChange: (next: ScenarioItem[]) => void;
}) {
  function updateScenario(index: number, nextScenario: ScenarioItem) {
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index ? nextScenario : item,
      ),
    );
  }

  function removeScenario(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function addScenario() {
    onChange([...value, { title: "", expectedResult: "" }]);
  }

  return (
    <div className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <h4 className={styles.editorTitle}>{title}</h4>
        <Button
          type="button"
          variant="secondary"
          onClick={addScenario}
          disabled={disabled}
        >
          <Plus size={14} />
          Add Scenario
        </Button>
      </div>

      {value.length ? (
        <div className={styles.editorCards}>
          {value.map((scenario, index) => (
            <div key={index} className={styles.editorCard}>
              <div className={styles.editorHeaderInline}>
                <p className={styles.editorCardTitle}>Scenario {index + 1}</p>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => removeScenario(index)}
                  disabled={disabled}
                  aria-label={`Remove scenario ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <label className={styles.editorField}>
                <span className={styles.editorLabel}>Title</span>
                <input
                  className={styles.editorInput}
                  value={scenario.title}
                  onChange={(event) =>
                    updateScenario(index, {
                      ...scenario,
                      title: event.target.value,
                    })
                  }
                  disabled={disabled}
                />
              </label>

              <label className={styles.editorField}>
                <span className={styles.editorLabel}>Expected Result</span>
                <textarea
                  className={styles.editorTextarea}
                  rows={3}
                  value={scenario.expectedResult}
                  onChange={(event) =>
                    updateScenario(index, {
                      ...scenario,
                      expectedResult: event.target.value,
                    })
                  }
                  disabled={disabled}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No scenarios. Click Add Scenario.</p>
      )}
    </div>
  );
}

function StringListEditor({
  title,
  label,
  value,
  disabled,
  onChange,
}: {
  title: string;
  label: string;
  value: string[];
  disabled: boolean;
  onChange: (next: string[]) => void;
}) {
  return (
    <div className={styles.editorSection}>
      <h4 className={styles.editorTitle}>{title}</h4>
      <label className={styles.editorField}>
        <span className={styles.editorLabel}>{label} (one per line)</span>
        <textarea
          className={styles.editorTextarea}
          rows={10}
          value={value.join("\n")}
          onChange={(event) => onChange(splitLines(event.target.value))}
          disabled={disabled}
        />
      </label>
    </div>
  );
}

function createDraft(
  artifactType: ArtifactType,
  content: unknown,
): ArtifactDraft {
  return {
    testCases: artifactType === "test_cases" ? toTestCases(content) : [],
    checklist: artifactType === "checklist" ? toChecklist(content) : [],
    scenarios:
      artifactType === "negative_scenarios" || artifactType === "edge_cases"
        ? toScenarios(content)
        : [],
    recommendations:
      artifactType === "automation_recommendations" ? toChecklist(content) : [],
  };
}

function serializeDraft(
  artifactType: ArtifactType,
  draft: ArtifactDraft,
): unknown {
  if (artifactType === "test_cases") {
    return draft.testCases
      .map((item) => ({
        title: item.title.trim(),
        priority: item.priority.trim(),
        steps: item.steps.map((step) => step.trim()).filter(Boolean),
        expected_result: item.expectedResult.trim(),
      }))
      .filter(
        (item) => item.title || item.expected_result || item.steps.length > 0,
      );
  }

  if (artifactType === "checklist") {
    return draft.checklist.map((item) => item.trim()).filter(Boolean);
  }

  if (artifactType === "negative_scenarios" || artifactType === "edge_cases") {
    return draft.scenarios
      .map((item) => ({
        title: item.title.trim(),
        expected_result: item.expectedResult.trim(),
      }))
      .filter((item) => item.title);
  }

  if (artifactType === "automation_recommendations") {
    return draft.recommendations.map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function artifactLabel(type: ArtifactType) {
  return ARTIFACT_LABELS[type] ?? type;
}

function artifactDescription(type: ArtifactType) {
  return ARTIFACT_DESCRIPTIONS[type] ?? "Generated artifact content.";
}

function artifactIcon(type: ArtifactType) {
  switch (type) {
    case "test_cases":
      return <FileCheck2 size={18} />;
    case "checklist":
      return <ListChecks size={18} />;
    case "negative_scenarios":
      return <ShieldAlert size={18} />;
    case "edge_cases":
      return <AlertTriangle size={18} />;
    case "automation_recommendations":
      return <Bot size={18} />;
    default:
      return <Route size={18} />;
  }
}

function contentSummary(content: unknown) {
  if (Array.isArray(content)) {
    return `${content.length} item${content.length === 1 ? "" : "s"}`;
  }

  if (content && typeof content === "object") {
    const fields = Object.keys(content).length;
    return `${fields} field${fields === 1 ? "" : "s"}`;
  }

  if (typeof content === "string") {
    return content.trim() ? "Text" : "Empty";
  }

  return "Unknown";
}

function toPrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function ArtifactPreview({
  artifactType,
  content,
}: {
  artifactType: ArtifactType;
  content: unknown;
}) {
  if (artifactType === "test_cases") {
    const testCases = toTestCases(content);

    if (testCases.length) {
      return (
        <ol className={styles.previewCaseList}>
          {testCases.map((testCase, index) => (
            <li
              key={`${testCase.title}-${index}`}
              className={styles.previewCaseItem}
            >
              <div className={styles.previewCaseHeader}>
                <div className={styles.previewCaseIndex}>{index + 1}</div>
                <h5 className={styles.previewCaseTitle}>{testCase.title}</h5>
                {testCase.priority ? (
                  <span
                    className={`${styles.priorityBadge} ${priorityToneClass(testCase.priority)}`}
                  >
                    {capitalize(testCase.priority)}
                  </span>
                ) : null}
              </div>

              {testCase.steps.length ? (
                <>
                  <p className={styles.previewLabel}>Steps</p>
                  <ol className={styles.previewSteps}>
                    {testCase.steps.map((step, stepIndex) => (
                      <li key={`${index}-step-${stepIndex}`}>{step}</li>
                    ))}
                  </ol>
                </>
              ) : null}

              {testCase.expectedResult ? (
                <>
                  <p className={styles.previewLabel}>Expected Result</p>
                  <p className={styles.previewExpected}>
                    {testCase.expectedResult}
                  </p>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      );
    }
  }

  if (artifactType === "checklist") {
    const checklist = toChecklist(content);

    if (checklist.length) {
      return (
        <ul className={styles.previewChecklist}>
          {checklist.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      );
    }
  }

  if (artifactType === "negative_scenarios" || artifactType === "edge_cases") {
    const scenarios = toScenarios(content);

    if (scenarios.length) {
      return (
        <ul className={styles.previewScenarioList}>
          {scenarios.map((scenario, index) => (
            <li
              key={`${scenario.title}-${index}`}
              className={styles.previewScenarioItem}
            >
              <h5 className={styles.previewScenarioTitle}>{scenario.title}</h5>
              {scenario.expectedResult ? (
                <>
                  <p className={styles.previewLabel}>Expected Result</p>
                  <p className={styles.previewExpected}>
                    {scenario.expectedResult}
                  </p>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      );
    }
  }

  if (Array.isArray(content) && content.length) {
    return (
      <ul className={styles.previewList}>
        {content.map((entry, index) => (
          <li key={index} className={styles.previewItem}>
            <pre>{toPrettyJson(entry)}</pre>
          </li>
        ))}
      </ul>
    );
  }

  if (content && typeof content === "object") {
    return (
      <div className={styles.previewSingle}>
        <pre>{toPrettyJson(content)}</pre>
      </div>
    );
  }

  if (typeof content === "string" && content.trim()) {
    return <p className={styles.previewText}>{content}</p>;
  }

  return <p className={styles.empty}>No content.</p>;
}

function toTestCases(content: unknown): TestCaseItem[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = stringValue(record.title);

      if (!title) {
        return null;
      }

      return {
        title,
        priority: stringValue(record.priority),
        steps: stringList(record.steps),
        expectedResult:
          stringValue(record.expected_result) ||
          stringValue(record.expectedResult),
      };
    })
    .filter((item): item is TestCaseItem => Boolean(item));
}

function toChecklist(content: unknown): string[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toScenarios(content: unknown): ScenarioItem[] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = stringValue(record.title);

      if (!title) {
        return null;
      }

      return {
        title,
        expectedResult:
          stringValue(record.expected_result) ||
          stringValue(record.expectedResult),
      };
    })
    .filter((item): item is ScenarioItem => Boolean(item));
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function capitalize(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function priorityToneClass(priority: string) {
  const normalized = priority.toLowerCase();

  if (normalized === "high") {
    return styles.priorityHigh;
  }

  if (normalized === "medium") {
    return styles.priorityMedium;
  }

  return styles.priorityLow;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
