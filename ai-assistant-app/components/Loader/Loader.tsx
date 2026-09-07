import type { ReactNode } from "react";
import styles from "./Loader.module.scss";

export type LoaderSize = "sm" | "md" | "lg";
export type LoaderVariant = "primary" | "neutral" | "white" | "inherit";

export type LoaderProps = {
  size?: LoaderSize;
  label?: ReactNode;
  centered?: boolean;
  fullPage?: boolean;
  variant?: LoaderVariant;
  className?: string;
  spinnerClassName?: string;
  labelClassName?: string;
};

export function Loader({
  size = "md",
  label,
  centered = false,
  fullPage = false,
  variant = "primary",
  className,
  spinnerClassName,
  labelClassName,
}: LoaderProps) {
  const containerClasses = [
    styles.container,
    styles[size],
    styles[variant],
    centered || fullPage ? styles.centered : "",
    fullPage ? styles.fullPage : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const spinnerClasses = [styles.spinner, spinnerClassName ?? ""]
    .filter(Boolean)
    .join(" ");

  const labelClasses = [styles.label, labelClassName ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <span className={spinnerClasses} aria-hidden="true" />
      {label ? (
        <span className={labelClasses}>{label}</span>
      ) : (
        <span className={styles.srOnly}>Loading...</span>
      )}
    </div>
  );
}
