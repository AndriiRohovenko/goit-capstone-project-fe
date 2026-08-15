import type { ReactNode } from "react";
import styles from "./Modal.module.scss";

type ModalBlockProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function ModalBlock({
  title,
  children,
  action,
  className,
}: ModalBlockProps) {
  return (
    <section
      className={`${styles.infoBlock}${className ? ` ${className}` : ""}`}
    >
      <div className={styles.infoBlockHeader}>
        <h4 className={styles.infoBlockTitle}>{title}</h4>
        {action ?? null}
      </div>

      {children}
    </section>
  );
}
