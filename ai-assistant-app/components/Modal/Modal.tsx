"use client";

import { useCallback, useEffect, useId, type ReactNode } from "react";
import styles from "./Modal.module.scss";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeDisabled?: boolean;
  closeGuard?: () => boolean;
  size?: "default" | "sm";
};

export function Modal({
  open,
  onClose,
  title,
  children,
  closeDisabled = false,
  closeGuard,
  size = "default",
}: ModalProps) {
  const titleId = useId();

  const canClose = useCallback(
    () => !closeDisabled && (closeGuard ? closeGuard() : true),
    [closeDisabled, closeGuard],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && canClose()) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canClose, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={() => {
        if (canClose()) {
          onClose();
        }
      }}
    >
      <div
        className={`${styles.panel} ${size === "sm" ? styles.smallPanel : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
