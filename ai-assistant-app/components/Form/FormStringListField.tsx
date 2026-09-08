"use client";

import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import { EditableStringList } from "./EditableStringList";

type FormStringListFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
  disabled?: boolean;
  addLabel?: string;
  itemPlaceholder?: string;
  itemAriaLabelPrefix?: string;
  emptyText?: string;
};

export function FormStringListField<TFieldValues extends FieldValues>({
  name,
  rules,
  disabled,
  addLabel,
  itemPlaceholder,
  itemAriaLabelPrefix,
  emptyText,
}: FormStringListFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field } = useController({ name, control, rules });

  return (
    <EditableStringList
      items={(field.value as string[] | undefined) ?? []}
      onChange={field.onChange}
      disabled={disabled}
      addLabel={addLabel}
      itemPlaceholder={itemPlaceholder}
      itemAriaLabelPrefix={itemAriaLabelPrefix}
      emptyText={emptyText}
    />
  );
}
