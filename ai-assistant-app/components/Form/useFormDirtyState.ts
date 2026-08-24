"use client";

import { useEffect } from "react";
import { useFormContext, useFormState, type FieldValues } from "react-hook-form";

export function useFormDirtyState<TFieldValues extends FieldValues>(
  onDirtyChange?: (isDirty: boolean) => void,
) {
  const { control } = useFormContext<TFieldValues>();
  const { isDirty } = useFormState({ control });

  useEffect(() => {
    onDirtyChange?.(isDirty);
    return () => onDirtyChange?.(false);
  }, [isDirty, onDirtyChange]);

  return isDirty;
}
