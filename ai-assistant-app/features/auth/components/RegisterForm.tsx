"use client";

import { useState } from "react";
import Link from "next/link";
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

type RegisterFormValues = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export function RegisterForm() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(values: RegisterFormValues) {
    setError(null);
    setPending(true);

    try {
      const email = values.email.trim();
      await register({
        name: values.name.trim(),
        surname: values.surname.trim(),
        email,
        password: values.password,
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
          <span className={styles.email}>{submittedEmail}</span>. Open it to
          verify your account, then sign in.
        </p>
        <Link href="/login" className={styles.buttonLink}>
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <Form<RegisterFormValues>
      className={styles.form}
      defaultValues={{
        name: "",
        surname: "",
        email: "",
        password: "",
      }}
      onSubmit={handleSubmit}
    >
      <h1 className={styles.title}>Create account</h1>

      <FormField<RegisterFormValues> name="name" label="Name">
        <FormInput<RegisterFormValues>
          name="name"
          type="text"
          autoComplete="given-name"
          disabled={pending}
          rules={{
            required: "Name is required.",
            validate: (value) =>
              (typeof value === "string" && value.trim().length > 0) ||
              "Name is required.",
          }}
        />
      </FormField>

      <FormField<RegisterFormValues> name="surname" label="Surname">
        <FormInput<RegisterFormValues>
          name="surname"
          type="text"
          autoComplete="family-name"
          disabled={pending}
          rules={{
            required: "Surname is required.",
            validate: (value) =>
              (typeof value === "string" && value.trim().length > 0) ||
              "Surname is required.",
          }}
        />
      </FormField>

      <FormField<RegisterFormValues> name="email" label="Email">
        <FormInput<RegisterFormValues>
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

      <FormField<RegisterFormValues> name="password" label="Password">
        <FormInput<RegisterFormValues>
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={pending}
          rules={{
            required: "Password is required.",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters.",
            },
          }}
        />
      </FormField>

      <FormError message={error} />

      <Button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "Creating account…" : "Register"}
      </Button>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </Form>
  );
}
