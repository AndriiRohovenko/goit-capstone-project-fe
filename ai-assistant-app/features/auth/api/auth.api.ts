import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  TokenResponse,
} from "@/types/auth";

function storeTokens(data: TokenResponse) {
  setTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
  });
}

/**
 * FastAPI OAuth2PasswordRequestForm expects
 * `application/x-www-form-urlencoded` with `username` + `password`.
 */
export async function login(payload: LoginPayload): Promise<AuthUser> {
  const form = new URLSearchParams();
  form.set("username", payload.email);
  form.set("password", payload.password);

  const { data } = await apiClient.post<TokenResponse>("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  storeTokens(data);
  return getMe();
}

/**
 * Signup creates an unverified user and sends a verification email.
 * Response is the user only — no tokens; do not treat as logged in.
 */
export async function signup(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>("/auth/signup", payload);
  return data;
}

/**
 * GET /auth/verify-email?token=...
 * 200 → token payload → store tokens → return /users/me
 * Uses bare axios so no Authorization header is attached.
 */
export async function verifyEmail(token: string): Promise<AuthUser> {
  const { data } = await axios.get<TokenResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`,
    {
      params: { token },
    },
  );

  storeTokens(data);
  return getMe();
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearTokens();
  }
}

/** POST /auth/reset-password — change password with current credentials. */
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  await apiClient.post("/auth/reset-password", payload);
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/users/me");
  return data;
}
