import { NextFunction, Request, Response } from "express";
import { ZodType, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

const formatIssues = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

export const validate = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        ApiError.badRequest(
          "Validation failed",
          formatIssues(result.error)
        )
      );
      return;
    }
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        ApiError.badRequest(
          "Invalid query parameters",
          formatIssues(result.error)
        )
      );
      return;
    }
    Object.defineProperty(req, "query", {
      value: result.data,
      writable: true,
      configurable: true,
    });
    next();
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(ApiError.badRequest("Invalid route parameters", formatIssues(result.error)));
      return;
    }
    Object.defineProperty(req, "params", {
      value: result.data,
      writable: true,
      configurable: true,
    });
    next();
  };
};
