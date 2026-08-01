"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import styles from "./Header.module.scss";

export function Header() {
  const { user, isAuthenticated, isReady, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}>
            AI Test Design
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard/projects" className={styles.link}>
              Projects
            </Link>
          ) : null}
        </nav>

        <div className={styles.actions}>
          {!isReady ? (
            <span className={styles.pending}>…</span>
          ) : isAuthenticated ? (
            <>
              {user?.email ? (
                <span className={styles.email}>{user.email}</span>
              ) : null}
              <button
                type="button"
                onClick={() => void logout()}
                className={styles.button}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className={styles.link}>
                Register
              </Link>
              <Link href="/login" className={styles.login}>
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
