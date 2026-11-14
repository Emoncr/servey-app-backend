import { Request, Response } from "express";
import { SigninInput, SignupInput } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { 
  authCookieOptions,
  clearCookieOptions,
  TOKEN_COOKIE_NAME,
} from "../utils/generateToken";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as SignupInput;
  const { user, token } = await authService.signup(input);

  res.cookie(TOKEN_COOKIE_NAME, token, authCookieOptions);

  return new ApiResponse(201, "Account created successfully", { user }).send(res);
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as SigninInput;
  const { user, token } = await authService.signin(input);

  res.cookie(TOKEN_COOKIE_NAME, token, authCookieOptions);

  return new ApiResponse(200, "Signed in successfully", { user }).send(res);
});

export const signout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(TOKEN_COOKIE_NAME, clearCookieOptions);
  return new ApiResponse(200, "Signed out successfully", null).send(res);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  return new ApiResponse(200, "Current user fetched successfully", { user }).send(
    res
  );
});
