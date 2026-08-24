"use client";

import type { FieldValues } from "react-hook-form";
import { useFormDirtyState } from "./useFormDirtyState";

type FormDirtyStateReporterProps<TFieldValues extends FieldValues> = {
  onDirtyChange?: (isDirty: boolean) => void;
};

export function FormDirtyStateReporter<TFieldValues extends FieldValues>({
  onDirtyChange,
}: FormDirtyStateReporterProps<TFieldValues>) {
  useFormDirtyState<TFieldValues>(onDirtyChange);
  return null;
}
