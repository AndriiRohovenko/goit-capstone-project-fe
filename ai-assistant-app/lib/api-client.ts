import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth-tokens";
import type { TokenResponse } from "@/types/auth";

const AUTH_SKIP_REFRESH_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/verify-email",
  "/auth/reset-password",
];

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type AuthFailureHandler = () => void;

let onAuthFailure: AuthFailureHandler | null = null;

/** Register a callback invoked when refresh fails (session is unrecoverable). */
export function setAuthFailureHandler(handler: AuthFailureHandler | null) {
  onAuthFailure = handler;
}

function shouldSkipRefresh(url?: string) {
  if (!url) return false;
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
}

async function refreshSession() {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    throw new Error("Missing refresh token");
  }

  // Bare axios call so the response interceptor does not recurse.
  const { data } = await axios.post<TokenResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
    { refresh_token: currentRefreshToken },
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  setTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? currentRefreshToken,
  });
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshSession();
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearTokens();
      onAuthFailure?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
