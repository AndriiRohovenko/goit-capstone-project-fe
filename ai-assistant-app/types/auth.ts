export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  surname: string;
};

/** FastAPI OAuth2-style token response from /auth/login */
export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
};

export type AuthResponse = {
  user: AuthUser;
};
