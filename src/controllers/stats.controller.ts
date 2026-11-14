import { Request, Response } from "express";
import * as statsService from "../services/stats.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await statsService.getStats();
  return new ApiResponse(200, "Stats fetched successfully", stats).send(res);
});
