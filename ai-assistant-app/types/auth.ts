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

export type ResetPasswordPayload = {
  email: string;
  old_password: string;
  new_password: string;
};

/** FastAPI OAuth2-style token response from login / verify-email / refresh */
export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
};
