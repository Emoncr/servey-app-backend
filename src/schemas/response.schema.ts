import { z } from "zod";

export const RESPONSE_SORTS = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
  "age-asc",
  "age-desc",
] as const;

export const surveySlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Survey slug is required")
  .max(120, "Survey slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid survey slug");

export const createResponseSchema = z.object({
  surveySlug: surveySlugSchema,
  answers: z.record(z.string(), z.unknown(), {
    error: "Survey answers are required",
  }),
});

export const updateResponseSchema = z.object({
  answers: z.record(z.string(), z.unknown(), {
    error: "Survey answers are required",
  }),
});

export const responseIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid response id"),
});

export const responseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).optional().default(""),
  educationLevel: z.string().trim().max(120).optional(),
  sort: z.enum(RESPONSE_SORTS).optional().default("newest"),
});

export type CreateResponseInput = z.infer<typeof createResponseSchema>;
export type UpdateResponseInput = z.infer<typeof updateResponseSchema>;
export type ResponseIdInput = z.infer<typeof responseIdSchema>;
export type ResponseQueryInput = z.infer<typeof responseQuerySchema>;
