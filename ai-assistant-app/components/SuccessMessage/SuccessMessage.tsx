"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ModalActions } from "@/components/Modal";
import styles from "./SuccessMessage.module.scss";

type SuccessMessageProps = {
  title?: string;
  description?: string;
  onClose: () => void;
  autoCloseMs?: number;
  closeLabel?: string;
};

export function SuccessMessage({
  title = "Saved successfully",
  description,
  onClose,
  autoCloseMs = 2000,
  closeLabel = "Close",
}: SuccessMessageProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onCloseRef.current();
    }, autoCloseMs);

    return () => window.clearTimeout(timeout);
  }, [autoCloseMs]);

  return (
    <section className={styles.root} role="status" aria-live="polite">
      <div className={styles.iconWrap} aria-hidden="true">
        <CheckCircle2 className={styles.icon} />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>

      <ModalActions>
        <Button type="button" variant="secondary" onClick={onClose}>
          {closeLabel}
        </Button>
      </ModalActions>
    </section>
  );
}
