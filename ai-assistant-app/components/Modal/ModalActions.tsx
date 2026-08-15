import type { ReactNode } from "react";
import styles from "./Modal.module.scss";

type ModalActionsProps = {
  children: ReactNode;
};

export function ModalActions({ children }: ModalActionsProps) {
  return <div className={styles.actions}>{children}</div>;
}
