"use client";

import type { SelectHTMLAttributes } from "react";
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import styles from "./Form.module.scss";

type FormSelectProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
  options: Array<{ value: string; label: string }>;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name">;

export function FormSelect<TFieldValues extends FieldValues>({
  name,
  rules,
  options,
  className,
  ...props
}: FormSelectProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();

  return (
    <select
      className={`${styles.select}${className ? ` ${className}` : ""}`}
      {...register(name, rules)}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
