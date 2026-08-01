"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/features/auth/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./Auth.module.scss";

export function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    setPending(true);

    try {
      await resetPassword({
        email,
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess(true);
      window.setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Could not reset password. Check your details and try again.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Password updated</h1>
        <p className={styles.text}>
          Your password was changed. Redirecting to sign in…
        </p>
        <Link href="/login" className={styles.link}>
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Reset password</h1>
      <p className={styles.text}>
        Enter your email and current password, then choose a new one.
      </p>

      <label className={styles.label}>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        Current password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        New password
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        Confirm new password
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={styles.input}
        />
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className={styles.button}
      >
        {pending ? "Updating…" : "Update password"}
      </button>

      <p className={styles.footer}>
        Remembered it?{" "}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
