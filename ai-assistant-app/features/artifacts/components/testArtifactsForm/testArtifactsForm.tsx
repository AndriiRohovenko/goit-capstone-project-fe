"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import {
  useArtifacts,
  useCreateArtifact,
} from "@/features/artifacts/queries/artifacts.queries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Artifact, TestArtifactType } from "@/types/artifacts";
import styles from "./testArtifactsForm.module.scss";

type TestArtifactsFormProps = {
  projectId: string;
  requirementId: string;
  onShowArtifacts: () => void;
};

const TEST_ARTIFACT_TYPES: TestArtifactType[] = [
  "test_cases",
  "checklist",
  "negative_scenarios",
];

export function TestArtifactsForm({
  projectId,
  requirementId,
  onShowArtifacts,
}: TestArtifactsFormProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const artifacts = useArtifacts(projectId, requirementId);
  const createArtifact = useCreateArtifact();

  const existingTestArtifacts = useMemo(
    () =>
      (artifacts.data ?? []).filter((artifact) =>
        isTestArtifactType(artifact.artifact_type),
      ),
    [artifacts.data],
  );

  const hasGenerated = existingTestArtifacts.length > 0;
  const isGenerating = createArtifact.isPending;

  const latestGeneratedAt = useMemo(() => {
    if (!existingTestArtifacts.length) {
      return null;
    }

    return existingTestArtifacts
      .map((artifact) => artifact.updated_at)
      .sort((a, b) => b.localeCompare(a))[0];
  }, [existingTestArtifacts]);

  async function handleGenerateOrRegenerate() {
    setActionError(null);

    try {
      await createArtifact.mutateAsync({
        projectId,
        requirementId,
        payload: { generation_type: "test_generation" },
      });
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Failed to generate test artifacts."),
      );
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <h4 className={styles.cardTitle}>Test Artifacts Generation</h4>
        <p className={styles.description}>
          Generate comprehensive test artifacts including test cases,
          checklists, and negative scenarios.
        </p>

        <Button
          type="button"
          className={styles.actionButton}
          onClick={() => void handleGenerateOrRegenerate()}
          disabled={artifacts.isPending || isGenerating}
        >
          <Sparkles size={16} strokeWidth={2.1} />
          {isGenerating
            ? "Generating..."
            : hasGenerated
              ? "Regenerate Artifacts"
              : "Generate Artifacts"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className={styles.secondaryButton}
          onClick={onShowArtifacts}
          disabled={artifacts.isPending}
        >
          Show all artifacts
        </Button>

        {actionError ? <p className={styles.error}>{actionError}</p> : null}

        <p className={styles.meta}>
          {latestGeneratedAt
            ? `Last generated: ${formatDate(latestGeneratedAt)}`
            : "No test artifacts generated yet."}
        </p>
      </div>
    </section>
  );
}

function isTestArtifactType(
  artifactType: Artifact["artifact_type"],
): artifactType is TestArtifactType {
  return TEST_ARTIFACT_TYPES.includes(artifactType as TestArtifactType);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
