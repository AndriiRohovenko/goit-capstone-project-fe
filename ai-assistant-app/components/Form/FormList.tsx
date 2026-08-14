import type { ReactNode } from "react";

type FormListProps<TItem> = {
  items: TItem[];
  as?: "ul" | "ol";
  renderItem?: (item: TItem, index: number) => ReactNode;
  getItemKey?: (item: TItem, index: number) => string;
  className?: string;
  itemClassName?: string;
  emptyText?: string;
  emptyClassName?: string;
};

export function FormList<TItem>({
  items,
  as = "ul",
  renderItem,
  getItemKey,
  className,
  itemClassName,
  emptyText,
  emptyClassName,
}: FormListProps<TItem>) {
  if (!items.length) {
    if (!emptyText) {
      return null;
    }

    return <p className={emptyClassName}>{emptyText}</p>;
  }

  const ListTag = as;

  return (
    <ListTag className={className}>
      {items.map((item, index) => (
        <li
          key={getItemKey ? getItemKey(item, index) : String(index)}
          className={itemClassName}
        >
          {renderItem ? renderItem(item, index) : String(item)}
        </li>
      ))}
    </ListTag>
  );
}
