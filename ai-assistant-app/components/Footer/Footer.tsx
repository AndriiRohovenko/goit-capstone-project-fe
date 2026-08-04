import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© 2026 AI Test Design Workspace</span>
        <span>Designed for thoughtful, traceable testing.</span>
      </div>
    </footer>
  );
}
