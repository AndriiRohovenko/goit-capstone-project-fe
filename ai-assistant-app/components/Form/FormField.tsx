"use client";

import type { ReactNode } from "react";
import {
  useFormContext,
  useFormState,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import styles from "./Form.module.scss";

type FormFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  children: ReactNode;
};

export function FormField<TFieldValues extends FieldValues>({
  name,
  label,
  children,
}: FormFieldProps<TFieldValues>) {
  const { getFieldState, control } = useFormContext<TFieldValues>();
  const formState = useFormState({ control });
  const { error } = getFieldState(name, formState);
  const message = error?.message ? String(error.message) : null;

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {children}
      </label>
      {message ? <p className={styles.fieldError}>{message}</p> : null}
    </div>
  );
}
