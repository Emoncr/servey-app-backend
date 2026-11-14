import { NextFunction, Request, Response } from "express";
import User from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { TOKEN_COOKIE_NAME, verifyToken } from "../utils/generateToken";

const extractToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.[TOKEN_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
};

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      throw ApiError.unauthorized("Authentication required. Please sign in.");
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw ApiError.unauthorized("Session expired or invalid. Please sign in again.");
    }

    const user = await User.findById(payload.sub).select("name email role");
    if (!user) {
      throw ApiError.unauthorized("The account for this session no longer exists.");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  }
);

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(ApiError.unauthorized("Authentication required."));
    return;
  }
  if (req.user.role !== "admin") {
    next(ApiError.forbidden("Admin access required."));
    return;
  }
  next();
};
