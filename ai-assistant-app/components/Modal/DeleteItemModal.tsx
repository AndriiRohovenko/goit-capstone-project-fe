"use client";

import { Button } from "@/components/Button";
import { Modal } from "./Modal";
import { ModalActions } from "./ModalActions";
import { ModalError } from "./ModalError";
import styles from "./Modal.module.scss";

type DeleteItemModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemLabel: string;
  isPending?: boolean;
  error?: string | null;
};

export function DeleteItemModal({
  open,
  onClose,
  onConfirm,
  itemName,
  itemLabel,
  isPending = false,
  error = null,
}: DeleteItemModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Delete ${itemLabel}`}
      closeDisabled={isPending}
      size="sm"
    >
      <p className={styles.contentInlineText}>
        Delete {itemLabel} “{itemName}”? This cannot be undone.
      </p>

      <ModalError message={error} />

      <ModalActions>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="button" onClick={() => void onConfirm()} disabled={isPending}>
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
