import { Response } from "express";

export interface ApiPayload<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  send(res: Response): Response<ApiPayload<T>> {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}
