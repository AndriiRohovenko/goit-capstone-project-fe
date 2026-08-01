"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";

export function Header() {
  const { user, isAuthenticated, isReady, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold text-zinc-900">
            AI Test Design
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard/projects"
              className="text-zinc-600 hover:text-zinc-900"
            >
              Projects
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {!isReady ? (
            <span className="text-zinc-400">…</span>
          ) : isAuthenticated ? (
            <>
              {user?.email ? (
                <span className="hidden text-zinc-600 sm:inline">
                  {user.email}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded border border-zinc-300 px-3 py-1.5 font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-800"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
