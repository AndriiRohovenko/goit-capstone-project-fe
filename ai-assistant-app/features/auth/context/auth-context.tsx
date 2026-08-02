"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/features/auth/api/auth.api";
import { setAuthFailureHandler } from "@/lib/api-client";
import { clearTokens, hasAccessToken } from "@/lib/auth-tokens";
import { getQueryClient } from "@/lib/query-client";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const clearSession = useCallback(() => {
    clearTokens();
    setUser(null);
    getQueryClient().clear();
  }, []);

  const handleAuthFailure = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [clearSession, router]);

  useEffect(() => {
    setAuthFailureHandler(handleAuthFailure);
    return () => setAuthFailureHandler(null);
  }, [handleAuthFailure]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasAccessToken()) {
        if (!cancelled) {
          setUser(null);
          setIsReady(true);
        }
        return;
      }

      try {
        const me = await authApi.getMe();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          clearTokens();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const nextUser = await authApi.login(payload);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    // Signup does not create a session — email must be verified first.
    await authApi.signup(payload);
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const nextUser = await authApi.verifyEmail(token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Still clear local session if the backend logout fails.
    } finally {
      clearSession();
      router.replace("/login");
    }
  }, [clearSession, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      login,
      register,
      verifyEmail,
      logout,
    }),
    [user, isReady, login, register, verifyEmail, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
