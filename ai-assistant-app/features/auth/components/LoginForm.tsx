"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./Auth.module.scss";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      await login({ email, password });
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Sign in</h1>

      {verified ? (
        <p className={styles.success}>
          Email verified. You can sign in now.
        </p>
      ) : null}

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
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={styles.input}
        />
      </label>

      <p className={styles.forgotPassword}>
        <Link href="/reset-password">
          Forgot password?
        </Link>
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className={styles.button}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className={styles.footer}>
        No account?{" "}
        <Link href="/register" className={styles.link}>
          Register
        </Link>
      </p>
    </form>
  );
}
