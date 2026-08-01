import type { ReactNode } from "react";
import styles from "./ContentPage.module.scss";

export function ContentPage({ children }: { children: ReactNode }) {
  return <main className={styles.content}>{children}</main>;
}
