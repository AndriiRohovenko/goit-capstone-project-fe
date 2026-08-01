/**
 * Bearer token holder for the API client layer.
 * Tokens are not exposed via React/TanStack Query/Redux.
 * sessionStorage keeps the session across reloads until HttpOnly cookies are available.
 */

const ACCESS_KEY = "ai_assistant_access_token";
const REFRESH_KEY = "ai_assistant_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;

function canUseStorage() {
  return typeof window !== "undefined";
}

function readStorage(key: string) {
  if (!canUseStorage()) return null;
  return sessionStorage.getItem(key);
}

function writeStorage(key: string, value: string | null) {
  if (!canUseStorage()) return;
  if (value) {
    sessionStorage.setItem(key, value);
  } else {
    sessionStorage.removeItem(key);
  }
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  accessToken = readStorage(ACCESS_KEY);
  return accessToken;
}

export function getRefreshToken() {
  if (refreshToken) return refreshToken;
  refreshToken = readStorage(REFRESH_KEY);
  return refreshToken;
}

export function setTokens(tokens: {
  accessToken: string;
  refreshToken?: string | null;
}) {
  accessToken = tokens.accessToken;
  writeStorage(ACCESS_KEY, tokens.accessToken);

  if (tokens.refreshToken !== undefined) {
    refreshToken = tokens.refreshToken;
    writeStorage(REFRESH_KEY, tokens.refreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  writeStorage(ACCESS_KEY, null);
  writeStorage(REFRESH_KEY, null);
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}
