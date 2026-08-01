"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { useAuth } from "@/features/auth/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";

type Status = "loading" | "success" | "error";

export function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "Verifying your email…" : "Invalid verification link.",
  );
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    async function run() {
      try {
        // 200: store tokens → /users/me → AuthProvider → projects
        await verifyEmail(token!);
        setStatus("success");
        setMessage("Email verified. Signing you in…");
        router.replace("/dashboard/projects");
      } catch (err) {
        // 400 already verified → /login (no tokens)
        if (isAxiosError(err) && err.response?.status === 400) {
          router.replace("/login?verified=1");
          return;
        }

        // 404 / other → invalid or unknown token
        setStatus("error");
        setMessage(
          getApiErrorMessage(
            err,
            "Verification failed. The link may be invalid or expired.",
          ),
        );
      }
    }

    void run();
  }, [token, router, verifyEmail]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 text-center">
      <h1 className="text-2xl font-semibold">Email verification</h1>
      <p
        className={
          status === "error" ? "text-sm text-red-600" : "text-sm text-zinc-600"
        }
      >
        {message}
      </p>
      {status === "error" ? (
        <Link
          href="/login"
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Go to sign in
        </Link>
      ) : status === "success" ? (
        <p className="text-xs text-zinc-500">Redirecting to projects…</p>
      ) : null}
    </div>
  );
}
