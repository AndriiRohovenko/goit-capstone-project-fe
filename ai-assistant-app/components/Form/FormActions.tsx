import type { ReactNode } from "react";
import styles from "./Form.module.scss";

type FormActionsProps = {
  children: ReactNode;
};

export function FormActions({ children }: FormActionsProps) {
  return <div className={styles.actions}>{children}</div>;
}
