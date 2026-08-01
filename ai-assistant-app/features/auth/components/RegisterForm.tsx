"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";

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
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-sm text-zinc-600">
          We sent a verification link to{" "}
          <span className="font-medium text-zinc-900">{submittedEmail}</span>.
          Open it to verify your account, then sign in.
        </p>
        <Link
          href="/login"
          className="rounded bg-zinc-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
    >
      <h1 className="text-2xl font-semibold">Create account</h1>

      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          type="text"
          autoComplete="given-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Surname
        <input
          type="text"
          autoComplete="family-name"
          required
          value={surname}
          onChange={(event) => setSurname(event.target.value)}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Register"}
      </button>

      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
