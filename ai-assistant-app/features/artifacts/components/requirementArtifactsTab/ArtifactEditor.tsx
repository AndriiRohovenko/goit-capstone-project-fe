import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import type {
  ArtifactEditorProps,
  ScenarioItem,
  TestCaseItem,
} from "./artifactTab.types";
import { splitLines } from "./artifactTab.utils";
import styles from "./requirementArtifactsTab.module.scss";

export function ArtifactEditor({
  artifactType,
  draft,
  disabled,
  onDraftChange,
}: ArtifactEditorProps) {
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
