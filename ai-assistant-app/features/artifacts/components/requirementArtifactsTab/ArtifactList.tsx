import {
  AlertTriangle,
  Bot,
  FileCheck2,
  ListChecks,
  Route,
  ShieldAlert,
} from "lucide-react";
import type { Artifact, ArtifactType } from "@/types/artifacts";
import { artifactDescription, artifactLabel } from "./artifactTab.constants";
import { contentSummary, formatDate } from "./artifactTab.utils";
import styles from "./requirementArtifactsTab.module.scss";

export function ArtifactList({
  artifacts,
  onOpen,
}: {
  artifacts: Artifact[];
  onOpen: (artifactType: ArtifactType) => void;
}) {
  return (
    <ul className={styles.list}>
      {artifacts.map((artifact) => (
        <li key={artifact.id} className={styles.item}>
          <button
            type="button"
            className={styles.itemButton}
            onClick={() => onOpen(artifact.artifact_type)}
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
  );
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
