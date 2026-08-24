"use client";

import { useMemo, useState } from "react";
import type { Artifact } from "@/types/artifacts";
import { createDraft } from "./artifactTab.utils";
import type { ArtifactDraft } from "./artifactTab.types";

type UseArtifactDraftControllerParams = {
  artifact: Artifact | null;
};

export function useArtifactDraftController({
  artifact,
}: UseArtifactDraftControllerParams) {
  const initialDraft = useMemo(
    () =>
      artifact ? createDraft(artifact.artifact_type, artifact.content) : null,
    [artifact],
  );
  const [draft, setDraft] = useState<ArtifactDraft | null>(initialDraft);
  const [isEditMode, setIsEditMode] = useState(false);

  const isDraftDirty = useMemo(() => {
    if (!isEditMode || !draft || !initialDraft) {
      return false;
    }

    return JSON.stringify(draft) !== JSON.stringify(initialDraft);
  }, [draft, initialDraft, isEditMode]);

  function startEdit() {
    if (!artifact) {
      return;
    }

    setIsEditMode(true);
  }

  function cancelEdit() {
    setDraft(initialDraft);
    setIsEditMode(false);
  }

  function commitDraft() {
    setIsEditMode(false);
  }

  return {
    draft,
    isEditMode,
    isDraftDirty,
    setDraft,
    startEdit,
    cancelEdit,
    commitDraft,
  };
}
