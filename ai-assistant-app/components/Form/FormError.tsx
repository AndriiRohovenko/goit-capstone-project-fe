import styles from "./Form.module.scss";

type FormErrorProps = {
  message?: string | null;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return <p className={styles.formError}>{message}</p>;
}
