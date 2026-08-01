import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/auth-tokens";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
} from "@/types/auth";

function applyTokenResponse(data: TokenResponse) {
  setTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
  });
}

function isTokenResponse(data: unknown): data is TokenResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "access_token" in data &&
    typeof (data as TokenResponse).access_token === "string"
  );
}

/**
 * FastAPI OAuth2PasswordRequestForm expects
 * `application/x-www-form-urlencoded` with `username` + `password`.
 * Response is a bearer token pair (not HttpOnly cookies yet).
 */
export async function login(payload: LoginPayload): Promise<AuthUser> {
  const form = new URLSearchParams();
  form.set("username", payload.email);
  form.set("password", payload.password);

  const { data } = await apiClient.post<
    TokenResponse | AuthResponse | AuthUser
  >("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (isTokenResponse(data)) {
    applyTokenResponse(data);
    return getMe();
  }

  if (data && typeof data === "object" && "user" in data && data.user) {
    return data.user;
  }

  if (data && typeof data === "object" && "id" in data && "email" in data) {
    return data as AuthUser;
  }

  return getMe();
}

/**
 * Signup creates an unverified user and sends a verification email.
 * Response is the user only — no tokens; do not treat as logged in.
 */
export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse | AuthUser>(
    "/auth/signup",
    payload,
  );

  if (data && typeof data === "object" && "user" in data && data.user) {
    return data.user;
  }

  return data as AuthUser;
}

/**
 * GET /auth/verify-email?token=...
 * 200 → same token payload as login → store tokens → return /users/me
 * Uses bare axios so no Authorization header is attached.
 */
export async function verifyEmail(token: string): Promise<AuthUser> {
  const { data } = await axios.get<TokenResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`,
    {
      params: { token },
      withCredentials: true,
    },
  );

  if (!isTokenResponse(data)) {
    throw new Error(
      "Email verified, but the server did not return session tokens.",
    );
  }

  applyTokenResponse(data);
  return getMe();
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearTokens();
  }
}

export async function refresh(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const { data } = await apiClient.post<TokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });

  if (isTokenResponse(data)) {
    applyTokenResponse(data);
  }
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthResponse | AuthUser>("/users/me");

  if ("user" in data && data.user) {
    return data.user;
  }

  return data as AuthUser;
}
