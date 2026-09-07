import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader } from "@/components/Loader";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({
  children,
  variant = "primary",
  type = "button",
  isLoading = false,
  loadingLabel,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "secondary" ? styles.secondary : styles.primary;

  const content = isLoading ? (
    <Loader
      size="sm"
      variant={variant === "primary" ? "white" : "primary"}
      label={loadingLabel !== undefined ? loadingLabel : children}
    />
  ) : (
    children
  );

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`${styles.button} ${variantClass}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {content}
    </button>
  );
}
