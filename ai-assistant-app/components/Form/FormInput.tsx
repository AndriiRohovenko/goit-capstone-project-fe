"use client";

import type { InputHTMLAttributes } from "react";
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import styles from "./Form.module.scss";

type FormInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

export function FormInput<TFieldValues extends FieldValues>({
  name,
  rules,
  className,
  ...props
}: FormInputProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();

  return (
    <input
      className={`${styles.input}${className ? ` ${className}` : ""}`}
      {...register(name, rules)}
      {...props}
    />
  );
}
