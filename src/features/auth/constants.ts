import { CookieOptions } from "hono/utils/cookie";

export const AUTH_COOKIE = "xira-session";
export const AUTH_COOKIE_EXPIRATION = 60 * 60 * 24 * 30; // 30 days

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: AUTH_COOKIE_EXPIRATION,
};
