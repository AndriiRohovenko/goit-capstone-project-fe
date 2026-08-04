import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({
  children,
  variant = "primary",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "secondary" ? styles.secondary : styles.primary;

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
