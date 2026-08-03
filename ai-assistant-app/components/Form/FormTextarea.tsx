"use client";

import type { TextareaHTMLAttributes } from "react";
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import styles from "./Form.module.scss";

type FormTextareaProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">;

export function FormTextarea<TFieldValues extends FieldValues>({
  name,
  rules,
  className,
  ...props
}: FormTextareaProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();

  return (
    <textarea
      className={`${styles.textarea}${className ? ` ${className}` : ""}`}
      {...register(name, rules)}
      {...props}
    />
  );
}
