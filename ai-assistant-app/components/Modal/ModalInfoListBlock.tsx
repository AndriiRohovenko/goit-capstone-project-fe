import type { ReactNode } from "react";
import { ModalBlock } from "./ModalBlock";
import styles from "./Modal.module.scss";

type ModalInfoListBlockProps<T> = {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  action?: ReactNode;
  emptyText?: string;
  className?: string;
};

export function ModalInfoListBlock<T>({
  title,
  items,
  renderItem,
  action,
  emptyText = "No items.",
  className,
}: ModalInfoListBlockProps<T>) {
  return (
    <ModalBlock title={title} action={action} className={className}>
      {items.length > 0 ? (
        <ul className={styles.infoList}>
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{renderItem(item, index)}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.infoEmpty}>{emptyText}</p>
      )}
    </ModalBlock>
  );
}
