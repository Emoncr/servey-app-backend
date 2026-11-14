import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError";

export const publicSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(
      ApiError.tooManyRequests(
        "Too many survey submissions from this device. Please try again later."
      )
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(ApiError.tooManyRequests("Too many attempts. Please try again later."));
  },
});
