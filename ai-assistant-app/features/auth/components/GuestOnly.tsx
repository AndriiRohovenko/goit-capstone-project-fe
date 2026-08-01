"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";

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
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-600">
        Checking session…
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
