"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { useAuth } from "@/features/auth/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./Auth.module.scss";

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
    <div className={styles.container}>
      <h1 className={styles.title}>Email verification</h1>
      <p className={status === "error" ? styles.error : styles.text}>
        {message}
      </p>
      {status === "error" ? (
        <Link
          href="/login"
          className={styles.buttonLink}
        >
          Go to sign in
        </Link>
      ) : status === "success" ? (
        <p className={styles.smallText}>Redirecting to projects…</p>
      ) : null}
    </div>
  );
}
