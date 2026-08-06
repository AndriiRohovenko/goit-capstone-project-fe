"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  ChevronRight,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { useAuth } from "@/features/auth/context/auth-context";


import styles from "./Header.module.scss";

type NavItem = {
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  href?: string;
};

const navItems: NavItem[] = [
  { label: "Test Design", icon: ClipboardList, href: "/dashboard/projects" }
];

export function Header() {
  const { user, isAuthenticated, isReady, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = (user?.name ?? user?.email ?? "User")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href={isAuthenticated ? "/dashboard/projects" : "/"}
          className={styles.brand}
          aria-label="AI Test Design Workspace home"
        >
          <Image src="/logo.svg" alt="" width={28} height={28} priority />
          <span>AI Test Design Workspace</span>
        </Link>

        {isAuthenticated ? (
          <>
            <nav className={styles.nav} aria-label="Main navigation">
              {navItems.map(({ label, icon: Icon, href }) => {
                const isActive =
                  href === "/dashboard/projects" &&
                  pathname.startsWith("/dashboard/projects");
                const content = (
                  <>
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{label}</span>
                  </>
                );

                return href ? (
                  <Link
                    key={label}
                    href={href}
                    className={`${styles.navItem} ${
                      isActive ? styles.active : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {content}
                  </Link>
                ) : (
                  <button key={label} type="button" className={styles.navItem}>
                    {content}
                  </button>
                );
              })}
            </nav>

            <div className={styles.profile} ref={menuRef}>
              <button
                type="button"
                className={styles.profileTrigger}
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-label="Open account menu"
              >
                <span className={styles.avatar}>{initials}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={isMenuOpen ? styles.chevronOpen : ""}
                />
              </button>

              {isMenuOpen ? (
                <div className={styles.menu} role="menu">
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserRound size={18} strokeWidth={1.8} />
                    My Profile
                  </button>
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={18} strokeWidth={1.8} />
                    Preferences
                  </button>
                  <div className={styles.divider} />
                  <button
                    type="button"
                    className={`${styles.menuItem} ${styles.logout}`}
                    role="menuitem"
                    onClick={() => void logout()}
                  >
                    <LogOut size={18} strokeWidth={1.8} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className={styles.actions}>
            {!isReady ? (
              <span className={styles.pending}>…</span>
            ) : (
              <>
                <Link href="/register" className={styles.textLink}>
                  Register
                </Link>
                <Link href="/login" className={styles.login}>
                  Log in
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
