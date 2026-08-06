"use client";

import Link from "next/link";
import { ArrowLeft, Folder } from "lucide-react";
import type { Requirement } from "@/types/requirement";
import styles from "./RequirementHeader.module.scss";

type RequirementHeaderProps = {
  projectId: string;
  requirement: Requirement;
  groupName?: string;
};

export function RequirementHeader({
  projectId,
  requirement,
  groupName,
}: RequirementHeaderProps) {
  return (
    <section className={styles.card}>
      <Link href={`/dashboard/projects/${projectId}`} className={styles.backLink}>
        <ArrowLeft size={14} strokeWidth={2.2} />
        Back to Requirements
      </Link>

      <div className={styles.headerRow}>
        <span className={styles.idBadge}>{formatRequirementId(requirement.id)}</span>
        <div className={styles.copy}>
          <h1 className={styles.title}>{requirement.title}</h1>
          <p className={styles.subtitle}>
            {requirement.description?.trim() || "No description yet."}
          </p>

          <div className={styles.tags}>
            <Tag tone={styles.type}>{formatLabel(requirement.requirement_type)}</Tag>
            <Tag tone={priorityTone(requirement.priority)}>{formatLabel(requirement.priority)}</Tag>
            <Tag tone={statusTone(requirement.status)}>{formatLabel(requirement.status)}</Tag>
            <span className={styles.groupTag}>
              <Folder size={14} strokeWidth={1.9} />
              {groupName ?? "No group"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tag({ children, tone }: { children: string; tone: string }) {
  return <span className={`${styles.tag} ${tone}`}>{children}</span>;
}

function formatRequirementId(id: string) {
  if (!id) {
    return "REQ";
  }

  return id.length > 12 ? `REQ-${id.slice(0, 6).toUpperCase()}` : id.toUpperCase();
}

function formatLabel(value: string) {
  if (!value) {
    return "—";
  }

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function priorityTone(priority: string) {
  switch (priority?.toLowerCase()) {
    case "high":
      return styles.priorityHigh;
    case "low":
      return styles.priorityLow;
    default:
      return styles.priorityMedium;
  }
}

function statusTone(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return styles.statusApproved;
    case "in-review":
      return styles.statusReview;
    default:
      return styles.statusDraft;
  }
}