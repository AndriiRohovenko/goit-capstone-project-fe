"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import {
  Modal,
  ModalActions,
  ModalError,
  ModalInfoListBlock,
} from "@/components/Modal";
import {
  useCreateTestsCoverage,
  useTestsCoverage,
} from "@/features/testsCoverage/queries/testsCoverage.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { TestsCoverage } from "@/types/testsCoverage";
import styles from "./testsCoverageModal.module.scss";

type TestsCoverageModalProps = {
  projectId: string;
  requirementId: string;
  isOpen: boolean;
  onClose: () => void;
};

type CoveredArea = {
  area: string;
  artifactRefs: string[];
};

type PartialArea = {
  area: string;
  note: string;
  artifactRefs: string[];
};

type Recommendation = {
  text: string;
  category: string;
  priority: string;
};

type MissingScenario = {
  area: string;
  risk: string;
  scenarioType: string;
  title: string;
  artifactType: string;
  stepsOrItems: string[];
  expectedResult: string;
};

type CoverageData = {
  coveredAreas: CoveredArea[];
  partialAreas: PartialArea[];
  recommendations: Recommendation[];
  missingScenarios: MissingScenario[];
};

export function TestsCoverageModal({
  projectId,
  requirementId,
  isOpen,
  onClose,
}: TestsCoverageModalProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const coverageQuery = useTestsCoverage(projectId, requirementId);
  const createCoverage = useCreateTestsCoverage();

  const coverageData = useMemo(
    () => parseCoverageData(coverageQuery.data),
    [coverageQuery.data],
  );
  const hasCoverage = Boolean(coverageData);
  const isGenerating = createCoverage.isPending;

  function handleClose() {
    if (isGenerating) {
      return;
    }

    setActionError(null);
    setCopiedKey(null);
    onClose();
  }

  async function handleGenerateOrRegenerate() {
    setActionError(null);

    try {
      const result = await createCoverage.mutateAsync({
        projectId,
        requirementId,
      });

      if (!result) {
        setActionError("Failed to generate tests coverage review.");
      }
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to generate tests coverage review."),
      );
    }
  }

  async function copyItems(key: string, values: string[]) {
    if (!values.length || typeof navigator === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(values.join("\n"));
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setActionError("Could not copy to clipboard.");
    }
  }

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleClose}
        title="AI Test Coverage Review"
        closeDisabled={isGenerating}
      >
        <div className={styles.modalBody}>
          <p className={styles.modalSubtitle}>
            AI-generated test coverage analysis and recommendations.
          </p>

          <ModalActions>
            <Button
              type="button"
              onClick={() => void handleGenerateOrRegenerate()}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : hasCoverage
                  ? "Regenerate coverage"
                  : "Generate coverage"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isGenerating}
            >
              Close
            </Button>
          </ModalActions>

          <ModalError message={actionError} />

          {coverageQuery.isPending ? (
            <p className={styles.empty}>Loading coverage...</p>
          ) : coverageData ? (
            <div className={styles.reviewGrid}>
              <section className={styles.blockWide}>
                <h4 className={styles.blockTitle}>Coverage Summary</h4>
                <p className={styles.summary}>
                  Covered areas: {coverageData.coveredAreas.length}. Partial
                  areas: {coverageData.partialAreas.length}. Missing scenarios:{" "}
                  {coverageData.missingScenarios.length}. Recommendations:{" "}
                  {coverageData.recommendations.length}.
                </p>
              </section>

              <ModalInfoListBlock
                title="Covered Areas"
                items={coverageData.coveredAreas.map((item) =>
                  formatCoveredArea(item),
                )}
              />

              <ModalInfoListBlock
                title="Partial Areas"
                items={coverageData.partialAreas.map((item) =>
                  formatPartialArea(item),
                )}
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void copyItems(
                        "partial",
                        coverageData.partialAreas.map((item) =>
                          formatPartialArea(item),
                        ),
                      )
                    }
                  >
                    {copiedKey === "partial" ? "Copied" : "Copy"}
                  </Button>
                }
              />

              <ModalInfoListBlock
                title="Recommendations"
                items={coverageData.recommendations.map((item) =>
                  formatRecommendation(item),
                )}
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void copyItems(
                        "recommendations",
                        coverageData.recommendations.map((item) =>
                          formatRecommendation(item),
                        ),
                      )
                    }
                  >
                    {copiedKey === "recommendations" ? "Copied" : "Copy"}
                  </Button>
                }
              />

              <ModalInfoListBlock
                title="Missing Scenarios"
                items={coverageData.missingScenarios.map((item) =>
                  formatMissingScenario(item),
                )}
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void copyItems(
                        "missing",
                        coverageData.missingScenarios.map((item) =>
                          formatMissingScenario(item),
                        ),
                      )
                    }
                  >
                    {copiedKey === "missing" ? "Copied" : "Copy"}
                  </Button>
                }
              />
            </div>
          ) : (
            <p className={styles.empty}>
              No coverage generated yet. Click Generate coverage to create it.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

function parseCoverageData(
  coverage: TestsCoverage | null | undefined,
): CoverageData | null {
  const content = toObject(coverage?.content) ?? toObject(coverage as unknown);

  if (!content) {
    return null;
  }

  return {
    coveredAreas: readCoveredAreas(content.covered_areas),
    partialAreas: readPartialAreas(content.partial_areas),
    recommendations: readRecommendations(content.recommendations),
    missingScenarios: readMissingScenarios(content.missing_scenarios),
  };
}

function toObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function readCoveredAreas(value: unknown): CoveredArea[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toObject(item))
    .filter(Boolean)
    .map((item) => ({
      area: readString(item.area),
      artifactRefs: readStringArray(item.artifact_refs),
    }))
    .filter((item) => Boolean(item.area));
}

function readPartialAreas(value: unknown): PartialArea[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toObject(item))
    .filter(Boolean)
    .map((item) => ({
      area: readString(item.area),
      note: readString(item.note),
      artifactRefs: readStringArray(item.artifact_refs),
    }))
    .filter((item) => Boolean(item.area));
}

function readRecommendations(value: unknown): Recommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toObject(item))
    .filter(Boolean)
    .map((item) => ({
      text: readString(item.text),
      category: readString(item.category),
      priority: readString(item.priority),
    }))
    .filter((item) => Boolean(item.text));
}

function readMissingScenarios(value: unknown): MissingScenario[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toObject(item))
    .filter(Boolean)
    .map((item) => {
      const suggestedArtifact = toObject(item.suggested_artifact);

      return {
        area: readString(item.area),
        risk: readString(item.risk),
        scenarioType: readString(item.scenario_type),
        title: readString(suggestedArtifact?.title),
        artifactType: readString(suggestedArtifact?.artifact_type),
        stepsOrItems: readStringArray(suggestedArtifact?.steps_or_items),
        expectedResult: readString(suggestedArtifact?.expected_result),
      };
    })
    .filter((item) => Boolean(item.area));
}

function formatCoveredArea(item: CoveredArea): string {
  const refs = item.artifactRefs.length
    ? ` | refs: ${item.artifactRefs.join(", ")}`
    : "";

  return `${item.area}${refs}`;
}

function formatPartialArea(item: PartialArea): string {
  const refs = item.artifactRefs.length
    ? ` | refs: ${item.artifactRefs.join(", ")}`
    : "";
  const note = item.note ? ` | note: ${item.note}` : "";

  return `${item.area}${note}${refs}`;
}

function formatRecommendation(item: Recommendation): string {
  const category = item.category
    ? `category: ${item.category}`
    : "category: n/a";
  const priority = item.priority
    ? `priority: ${item.priority}`
    : "priority: n/a";

  return `${item.text} | ${category} | ${priority}`;
}

function formatMissingScenario(item: MissingScenario): string {
  const scenarioType = item.scenarioType || "n/a";
  const risk = item.risk || "n/a";
  const artifactType = item.artifactType || "n/a";
  const title = item.title || "Untitled scenario";
  const steps = item.stepsOrItems.length
    ? ` | steps: ${item.stepsOrItems.join(" -> ")}`
    : "";
  const expected = item.expectedResult
    ? ` | expected: ${item.expectedResult}`
    : "";

  return `${item.area} | type: ${scenarioType} | risk: ${risk} | artifact: ${artifactType} | title: ${title}${steps}${expected}`;
}
