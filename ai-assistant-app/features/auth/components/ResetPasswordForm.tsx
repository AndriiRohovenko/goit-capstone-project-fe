"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import {
  Form,
  FormError,
  FormField,
  FormInput,
} from "@/components/Form";
import { resetPassword } from "@/features/auth/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./Auth.module.scss";

type ResetPasswordFormValues = {
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(values: ResetPasswordFormValues) {
    setError(null);
    setPending(true);

    try {
      await resetPassword({
        email: values.email.trim(),
        old_password: values.oldPassword,
        new_password: values.newPassword,
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
    <Form<ResetPasswordFormValues>
      className={styles.form}
      defaultValues={{
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      onSubmit={handleSubmit}
    >
      <h1 className={styles.title}>Reset password</h1>
      <p className={styles.text}>
        Enter your email and current password, then choose a new one.
      </p>

      <FormField<ResetPasswordFormValues> name="email" label="Email">
        <FormInput<ResetPasswordFormValues>
          name="email"
          type="email"
          autoComplete="email"
          disabled={pending}
          rules={{
            required: "Email is required.",
            validate: (value) =>
              (typeof value === "string" && value.trim().length > 0) ||
              "Email is required.",
          }}
        />
      </FormField>

      <FormField<ResetPasswordFormValues>
        name="oldPassword"
        label="Current password"
      >
        <FormInput<ResetPasswordFormValues>
          name="oldPassword"
          type="password"
          autoComplete="current-password"
          disabled={pending}
          rules={{ required: "Current password is required." }}
        />
      </FormField>

      <FormField<ResetPasswordFormValues>
        name="newPassword"
        label="New password"
      >
        <FormInput<ResetPasswordFormValues>
          name="newPassword"
          type="password"
          autoComplete="new-password"
          disabled={pending}
          rules={{
            required: "New password is required.",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters.",
            },
            validate: (value, formValues) =>
              value !== formValues.oldPassword ||
              "New password must be different from the current password.",
          }}
        />
      </FormField>

      <FormField<ResetPasswordFormValues>
        name="confirmPassword"
        label="Confirm new password"
      >
        <FormInput<ResetPasswordFormValues>
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={pending}
          rules={{
            required: "Please confirm your new password.",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters.",
            },
            validate: (value, formValues) =>
              value === formValues.newPassword ||
              "New passwords do not match.",
          }}
        />
      </FormField>

      <FormError message={error} />

      <Button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>

      <p className={styles.footer}>
        Remembered it?{" "}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </Form>
  );
}
