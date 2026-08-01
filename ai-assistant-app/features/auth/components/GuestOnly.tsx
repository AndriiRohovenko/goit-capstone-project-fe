"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import styles from "./Auth.module.scss";

/** Redirects authenticated users away from guest-only pages (home, login, register, reset password). */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/dashboard/projects");
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady) {
    return (
      <div className={styles.status}>
        Checking session…
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
