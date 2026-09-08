import { Plus, Trash2 } from "lucide-react";
import styles from "./EditableStringList.module.scss";

type EditableStringListProps = {
  items: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  addLabel?: string;
  itemPlaceholder?: string;
  itemAriaLabelPrefix?: string;
  emptyText?: string;
};

/** Shared row-based editor for string[] fields, used by requirement and artifact forms. */
export function EditableStringList({
  items,
  onChange,
  disabled = false,
  addLabel = "Add item",
  itemPlaceholder,
  itemAriaLabelPrefix = "item",
  emptyText,
}: EditableStringListProps) {
  function updateItem(index: number, value: string) {
    onChange(
      items.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div className={styles.list}>
      {items.length ? (
        items.map((item, index) => (
          <div key={index} className={styles.row}>
            <input
              className={styles.input}
              value={item}
              placeholder={itemPlaceholder}
              onChange={(event) => updateItem(index, event.target.value)}
              disabled={disabled}
            />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeItem(index)}
              disabled={disabled}
              aria-label={`Remove ${itemAriaLabelPrefix} ${index + 1}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))
      ) : emptyText ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : null}

      <button
        type="button"
        className={styles.addButton}
        onClick={addItem}
        disabled={disabled}
      >
        <Plus size={14} />
        {addLabel}
      </button>
    </div>
  );
}

export function sanitizeStringList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}
