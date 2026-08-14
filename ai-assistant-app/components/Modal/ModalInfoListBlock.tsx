import type { ReactNode } from "react";
import styles from "./Modal.module.scss";

type ModalInfoListBlockProps = {
  title: string;
  items: string[];
  action?: ReactNode;
  emptyText?: string;
  className?: string;
};

export function ModalInfoListBlock({
  title,
  items,
  action,
  emptyText = "No items.",
  className,
}: ModalInfoListBlockProps) {
  return (
    <section
      className={`${styles.infoBlock}${className ? ` ${className}` : ""}`}
    >
      <div className={styles.infoBlockHeader}>
        <h4 className={styles.infoBlockTitle}>{title}</h4>
        {action ?? null}
      </div>

      {items.length ? (
        <ul className={styles.infoList}>
          {items.map((item, index) => (
            <li key={`${title}-${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.infoEmpty}>{emptyText}</p>
      )}
    </section>
  );
}
