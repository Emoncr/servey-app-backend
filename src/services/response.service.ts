import { FilterQuery, SortOrder } from "mongoose";
import SurveyResponse, { ISurveyResponse } from "../models/Response.model";
import Survey, { ISurvey } from "../models/Survey.model";
import { buildAnswersSchema } from "../schemas/dynamicSurvey.schema";
import {
  CreateResponseInput,
  ResponseQueryInput,
  UpdateResponseInput,
} from "../schemas/response.schema";
import { ApiError } from "../utils/ApiError";
import {
  buildResponseSummary,
  SurveyAnswers,
} from "../utils/responseSummary";

const SORT_MAP: Record<ResponseQueryInput["sort"], Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "name-asc": { fullName: 1 },
  "name-desc": { fullName: -1 },
  "age-asc": { age: 1 },
  "age-desc": { age: -1 },
};

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = (
  search: string,
  educationLevel?: string
): FilterQuery<ISurveyResponse> => {
  const filter: FilterQuery<ISurveyResponse> = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { fullName: regex },
      { university: regex },
      { department: regex },
      { phone: regex },
      { email: regex },
    ];
  }

  if (educationLevel) {
    filter.educationLevel = educationLevel;
  }

  return filter;
};

const getSurvey = async (slug: string): Promise<ISurvey> => {
  const survey = await Survey.findOne({ slug: slug.toLowerCase() });

  if (!survey) {
    throw ApiError.notFound("Survey not found");
  }

  return survey;
};

const validateAnswers = (
  survey: ISurvey,
  answers: SurveyAnswers
): SurveyAnswers => {
  const result = buildAnswersSchema(survey).safeParse(answers);

  if (!result.success) {
    throw ApiError.badRequest(
      "Validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }))
    );
  }

  return result.data as SurveyAnswers;
};

export const createResponse = async (
  input: CreateResponseInput
): Promise<ISurveyResponse> => {
  const survey = await getSurvey(input.surveySlug);
  const answers = validateAnswers(survey, input.answers);

  return SurveyResponse.create(buildResponseSummary(survey.slug, answers));
};

export const listResponses = async (query: ResponseQueryInput) => {
  const { page, limit, search, educationLevel, sort } = query;
  const filter = buildFilter(search, educationLevel);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    SurveyResponse.find(filter)
      .sort(SORT_MAP[sort])
      .skip(skip)
      .limit(limit),
    SurveyResponse.countDocuments(filter),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getResponseById = async (
  id: string
): Promise<ISurveyResponse> => {
  const response = await SurveyResponse.findById(id);
  if (!response) {
    throw ApiError.notFound("Survey response not found");
  }
  return response;
};

export const updateResponse = async (
  id: string,
  input: UpdateResponseInput
): Promise<ISurveyResponse> => {
  const response = await SurveyResponse.findById(id);

  if (!response) {
    throw ApiError.notFound("Survey response not found");
  }

  const survey = await getSurvey(response.surveySlug);
  const answers = validateAnswers(survey, input.answers);

  response.set(buildResponseSummary(survey.slug, answers));
  await response.save();

  return response;
};

export const deleteResponse = async (
  id: string
): Promise<ISurveyResponse> => {
  const response = await SurveyResponse.findByIdAndDelete(id);
  if (!response) {
    throw ApiError.notFound("Survey response not found");
  }
  return response;
};

const CSV_HEADERS = [
  "Survey",
  "Full Name",
  "Age",
  "Gender",
  "Email",
  "Phone",
  "Address",
  "Education Level",
  "University/Institute",
  "Department",
  "Current Education Status",
  "Occupation",
  "Additional Comments",
  "Submitted At",
];

const cell = (value: unknown): string => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
};

export const exportResponsesCsv = async (): Promise<string> => {
  const responses = await SurveyResponse.find().sort({ createdAt: -1 }).lean();

  const rows = responses.map((item) =>
    [
      item.surveySlug,
      item.fullName,
      item.age,
      item.gender,
      item.email,
      item.phone,
      item.address ?? "",
      item.educationLevel,
      item.university,
      item.department,
      item.currentStatus,
      item.occupation ?? "",
      item.additionalComments ?? "",
      item.createdAt.toISOString(),
    ]
      .map(cell)
      .join(",")
  );

  return [CSV_HEADERS.map(cell).join(","), ...rows].join("\r\n");
};
