import styles from "./Modal.module.scss";

type ModalErrorProps = {
  message?: string | null;
};

export function ModalError({ message }: ModalErrorProps) {
  if (!message) {
    return null;
  }

  return <p className={styles.error}>{message}</p>;
}
