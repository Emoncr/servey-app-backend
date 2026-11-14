import { Request, Response } from "express";
import * as surveyService from "../services/survey.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getSurvey = asyncHandler(async (req: Request, res: Response) => {
  const survey = await surveyService.getSurveyBySlug(req.params.slug);

  return new ApiResponse(200, "Survey fetched successfully", { survey }).send(
    res
  );
});
