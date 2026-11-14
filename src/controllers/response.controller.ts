import { Request, Response } from "express";
import {
  CreateResponseInput,
  ResponseQueryInput,
  UpdateResponseInput,
} from "../schemas/response.schema";
import * as responseService from "../services/response.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await responseService.createResponse(
      req.body as CreateResponseInput
    );

    return new ApiResponse(201, "Survey submitted successfully", {
      response,
    }).send(res);
  }
);

export const listResponses = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await responseService.listResponses(
      req.query as unknown as ResponseQueryInput
    );

    return new ApiResponse(200, "Responses fetched successfully", result).send(
      res
    );
  }
);

export const getResponse = asyncHandler(async (req: Request, res: Response) => {
  const response = await responseService.getResponseById(req.params.id);
  return new ApiResponse(200, "Response fetched successfully", {
    response,
  }).send(res);
});

export const updateResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await responseService.updateResponse(
      req.params.id,
      req.body as UpdateResponseInput
    );

    return new ApiResponse(200, "Response updated successfully", {
      response,
    }).send(res);
  }
);

export const deleteResponse = asyncHandler(
  async (req: Request, res: Response) => {
    await responseService.deleteResponse(req.params.id);
    return new ApiResponse(200, "Response deleted successfully", null).send(res);
  }
);

export const exportCsv = asyncHandler(async (_req: Request, res: Response) => {
  const csv = await responseService.exportResponsesCsv();
  const filename = `survey-responses-${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(`\uFEFF${csv}`);
});
