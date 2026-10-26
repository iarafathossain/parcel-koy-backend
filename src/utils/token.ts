import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVariables } from "../config/env";
import { cookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";

const authCookieOptions = {
  httpOnly: true,
  secure: envVariables.NODE_ENV === "production",
  sameSite:
    envVariables.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/",
};

export const parseDurationToMs = (duration: string): number => {
  const parsedDuration = duration.trim().toLowerCase();
  const match = parsedDuration.match(/^(\d+)(ms|s|m|h|d)$/);

  if (!match) {
    throw new Error(
      `Invalid duration format: "${duration}". Use formats like 500ms, 30s, 15m, 12h, or 7d.`,
    );
  }

  const value = Number(match[1]);
  const unit = match[2];

  const unitToMs: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * unitToMs[unit];
};

// Get Access token
const getAccessToken = (payload: JwtPayload) => {
  return jwtUtils.createToken(payload, envVariables.ACCESS_TOKEN_SECRET, {
    expiresIn: envVariables.ACCESS_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

// Get Refresh token
const getRefreshToken = (payload: JwtPayload) => {
  return jwtUtils.createToken(payload, envVariables.REFRESH_TOKEN_SECRET, {
    expiresIn: envVariables.REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

// Set Access token cookie
const setAccessTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "access_token", token, {
    ...authCookieOptions,
    maxAge: parseDurationToMs(envVariables.ACCESS_TOKEN_COOKIE_MAX_AGE),
  });
};

// Set Refresh token cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "refresh_token", token, {
    ...authCookieOptions,
    maxAge: parseDurationToMs(envVariables.REFRESH_TOKEN_COOKIE_MAX_AGE),
  });
};

// Set better auth session token cookie
const setBetterAuthSessionTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    ...authCookieOptions,
    maxAge: parseDurationToMs(envVariables.BETTER_AUTH_SESSION_COOKIE_MAX_AGE),
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionTokenCookie,
};
