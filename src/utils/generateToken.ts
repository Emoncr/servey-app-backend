import jwt, { SignOptions } from "jsonwebtoken";
import { CookieOptions } from "express";
import { env, isProduction } from "../config/env";

export const TOKEN_COOKIE_NAME = "token";
export const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const generateToken = (userId: string, role = "admin"): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, options);
};

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  maxAge: TOKEN_MAX_AGE_MS,
  path: "/",
};

export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & {
    sub: string;
    role?: string;
  };
};
