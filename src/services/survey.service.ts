import Survey, { ISurvey } from "../models/Survey.model";
import { ApiError } from "../utils/ApiError";

export const getSurveyBySlug = async (slug: string): Promise<ISurvey> => {
  const survey = await Survey.findOne({ slug: slug.toLowerCase() });

  if (!survey) {
    throw ApiError.notFound("Survey not found");
  }

  return survey;
};

export const getSurveyForResponse = async (
  slug: string
): Promise<ISurvey> => getSurveyBySlug(slug);
