import type { ReactNode } from "react";
import { ModalBlock } from "./ModalBlock";
import styles from "./Modal.module.scss";
import {
  formatAiContentValue,
  getBestObjectLabel,
  humanizeKey,
  isPlainObject,
  parseAiContentSections,
} from "@/lib/parse";

type ModalContentSectionsProps = {
  content: unknown;
  emptyText?: string;
};

export function ModalContentSections({
  content,
  emptyText = "No content available.",
}: ModalContentSectionsProps) {
  const rendered = renderContent(content, "content");

  if (!rendered) {
    return <p className={styles.infoEmpty}>{emptyText}</p>;
  }

  return <div className={styles.contentTree}>{rendered}</div>;
}

function renderContent(value: unknown, path: string): ReactNode {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return (
      <p className={styles.contentInlineText}>{formatAiContentValue(value)}</p>
    );
  }

  if (Array.isArray(value)) {
    return renderArray(value, path);
  }

  if (!isPlainObject(value)) {
    return (
      <pre className={styles.contentInlineText}>
        {formatAiContentValue(value)}
      </pre>
    );
  }

  const sections = parseAiContentSections(value);

  if (!sections.length) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <ModalBlock key={`${path}-${section.key}`} title={section.title}>
          {renderNestedValue(section.value, `${path}.${section.key}`)}
        </ModalBlock>
      ))}
    </>
  );
}

function renderNestedValue(value: unknown, path: string): ReactNode {
  if (value === null || value === undefined) {
    return <p className={styles.contentInlineText}>N/A</p>;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return (
      <p className={styles.contentInlineText}>{formatAiContentValue(value)}</p>
    );
  }

  if (Array.isArray(value)) {
    return renderArray(value, path);
  }

  if (!isPlainObject(value)) {
    return (
      <pre className={styles.contentInlineText}>
        {formatAiContentValue(value)}
      </pre>
    );
  }

  return (
    <dl className={styles.contentDefinitionList}>
      {Object.entries(value).map(([key, nestedValue]) => (
        <div key={`${path}-${key}`} className={styles.contentDefinitionItem}>
          <dt className={styles.contentDefinitionKey}>{humanizeKey(key)}</dt>
          <dd className={styles.contentDefinitionValue}>
            {renderNestedValue(nestedValue, `${path}.${key}`)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function renderArray(items: unknown[], path: string): ReactNode {
  if (!items.length) {
    return <p className={styles.infoEmpty}>No items.</p>;
  }

  const isPrimitiveArray = items.every(
    (item) =>
      item === null ||
      item === undefined ||
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean",
  );

  if (isPrimitiveArray) {
    return (
      <ul className={styles.contentPrimitiveList}>
        {items.map((item, index) => (
          <li key={`${path}-${index}`} className={styles.contentPrimitiveItem}>
            {formatAiContentValue(item)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.contentArrayList}>
      {items.map((item, index) => {
        const key = `${path}-${index}`;
        const label = getBestObjectLabel(item, `Item ${index + 1}`);

        if (isPlainObject(item)) {
          return (
            <ModalBlock key={key} title={label}>
              {renderNestedValue(item, key)}
            </ModalBlock>
          );
        }

        return (
          <ModalBlock key={key} title={`Item ${index + 1}`}>
            {renderNestedValue(item, key)}
          </ModalBlock>
        );
      })}
    </div>
  );
}
