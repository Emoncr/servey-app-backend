export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists"): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = "Too many requests"): ApiError {
    return new ApiError(429, message);
  }
}
