import type { ArtifactType } from "@/types/artifacts";
import { FormList } from "@/components/Form";
import {
  capitalize,
  toChecklist,
  toPrettyJson,
  toScenarios,
  toTestCases,
} from "./artifactTab.utils";
import styles from "./requirementArtifactsTab.module.scss";

export function ArtifactPreview({
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
                  <FormList
                    as="ol"
                    items={testCase.steps}
                    className={styles.previewSteps}
                    getItemKey={(step, stepIndex) =>
                      `${index}-step-${step}-${stepIndex}`
                    }
                  />
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
        <FormList
          items={checklist}
          className={styles.previewChecklist}
          getItemKey={(item, index) => `${item}-${index}`}
        />
      );
    }
  }

  if (artifactType === "negative_scenarios" || artifactType === "edge_cases") {
    const scenarios = toScenarios(content);

    if (scenarios.length) {
      return (
        <FormList
          items={scenarios}
          className={styles.previewScenarioList}
          itemClassName={styles.previewScenarioItem}
          getItemKey={(scenario, index) => `${scenario.title}-${index}`}
          renderItem={(scenario) => (
            <>
              <h5 className={styles.previewScenarioTitle}>{scenario.title}</h5>
              {scenario.expectedResult ? (
                <>
                  <p className={styles.previewLabel}>Expected Result</p>
                  <p className={styles.previewExpected}>
                    {scenario.expectedResult}
                  </p>
                </>
              ) : null}
            </>
          )}
        />
      );
    }
  }

  if (Array.isArray(content) && content.length) {
    return (
      <FormList
        items={content}
        className={styles.previewList}
        itemClassName={styles.previewItem}
        renderItem={(entry) => <pre>{toPrettyJson(entry)}</pre>}
      />
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
