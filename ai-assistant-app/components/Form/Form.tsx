"use client";

import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { ReactNode } from "react";
import styles from "./Form.module.scss";

type FormProps<TFieldValues extends FieldValues> = {
  children: ReactNode;
  onSubmit: SubmitHandler<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  className?: string;
  formOptions?: Omit<UseFormProps<TFieldValues>, "defaultValues">;
};

export function Form<TFieldValues extends FieldValues>({
  children,
  onSubmit,
  defaultValues,
  className,
  formOptions,
}: FormProps<TFieldValues>) {
  const methods = useForm<TFieldValues>({
    ...formOptions,
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form
        className={`${styles.form}${className ? ` ${className}` : ""}`}
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
