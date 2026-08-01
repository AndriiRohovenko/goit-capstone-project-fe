"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./Auth.module.scss";

export function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      await register({
        name: name.trim(),
        surname: surname.trim(),
        email,
        password,
      });
      setSubmittedEmail(email);
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed. Try again."));
    } finally {
      setPending(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.text}>
          We sent a verification link to{" "}
          <span className={styles.email}>{submittedEmail}</span>.
          Open it to verify your account, then sign in.
        </p>
        <Link
          href="/login"
          className={styles.buttonLink}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Create account</h1>

      <label className={styles.label}>
        Name
        <input
          type="text"
          autoComplete="given-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        Surname
        <input
          type="text"
          autoComplete="family-name"
          required
          value={surname}
          onChange={(event) => setSurname(event.target.value)}
          className={styles.input}
        />
      </label>

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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={styles.input}
        />
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className={styles.button}
      >
        {pending ? "Creating account…" : "Register"}
      </button>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
