import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { isProduction } from "../config/env";
import { ApiError } from "../utils/ApiError";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

interface ErrorPayload {
  success: false;
  message: string;
  data: unknown;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details ?? null;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = err.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    statusCode = 409;
    message = "A record with this value already exists";
  } else if (err instanceof Error && err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  } else if (err instanceof Error && err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  } else if (err instanceof Error) {
    message = isProduction ? "Internal server error" : err.message;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  const payload: ErrorPayload = {
    success: false,
    message,
    data: details,
  };

  res.status(statusCode).json(payload);
};
