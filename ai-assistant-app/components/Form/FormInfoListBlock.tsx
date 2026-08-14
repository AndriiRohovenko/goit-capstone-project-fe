import type { ReactNode } from "react";
import { FormList } from "./FormList";
import styles from "./Form.module.scss";

type FormInfoListBlockProps = {
  title: string;
  items: string[];
  action?: ReactNode;
  emptyText?: string;
  className?: string;
};

export function FormInfoListBlock({
  title,
  items,
  action,
  emptyText = "No items.",
  className,
}: FormInfoListBlockProps) {
  return (
    <section
      className={`${styles.infoBlock}${className ? ` ${className}` : ""}`}
    >
      <div className={styles.infoBlockHeader}>
        <h4 className={styles.infoBlockTitle}>{title}</h4>
        {action ?? null}
      </div>

      <FormList
        items={items}
        className={styles.infoList}
        getItemKey={(item, index) => `${title}-${item}-${index}`}
        emptyText={emptyText}
        emptyClassName={styles.infoEmpty}
      />
    </section>
  );
}
