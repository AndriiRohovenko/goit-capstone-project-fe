"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import {
  Form,
  FormError,
  FormField,
  FormInput,
} from "@/components/Form";
import { useAuth } from "@/features/auth/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./Auth.module.scss";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: LoginFormValues) {
    setError(null);
    setPending(true);

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      });
      router.replace("/dashboard/projects");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Login failed. Check your credentials and try again.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Form<LoginFormValues>
      className={styles.form}
      defaultValues={{ email: "", password: "" }}
      onSubmit={handleSubmit}
    >
      <h1 className={styles.title}>Sign in</h1>

      {verified ? (
        <p className={styles.success}>Email verified. You can sign in now.</p>
      ) : null}

      <FormField<LoginFormValues> name="email" label="Email">
        <FormInput<LoginFormValues>
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

      <FormField<LoginFormValues> name="password" label="Password">
        <FormInput<LoginFormValues>
          name="password"
          type="password"
          autoComplete="current-password"
          disabled={pending}
          rules={{ required: "Password is required." }}
        />
      </FormField>

      <p className={styles.forgotPassword}>
        <Link href="/reset-password">Forgot password?</Link>
      </p>

      <FormError message={error} />

      <Button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className={styles.footer}>
        No account?{" "}
        <Link href="/register" className={styles.link}>
          Register
        </Link>
      </p>
    </Form>
  );
}
