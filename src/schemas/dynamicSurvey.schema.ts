import { z } from "zod";
import type {
  ISurvey,
  ISurveyQuestion,
} from "../models/Survey.model";

export const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

export const normalizePhone = (value: string): string =>
  value.replace(/[\s()-]/g, "");

const isBlank = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

const buildQuestionSchema = (question: ISurveyQuestion): z.ZodTypeAny => {
  const required = question.required;

  if (question.type === "number") {
    const numberSchema = z
      .number({ error: `${question.label} is required` })
      .int(`${question.label} must be a whole number`);

    const bounded =
      question.min !== undefined && question.max !== undefined
        ? numberSchema
            .min(question.min, `${question.label} must be at least ${question.min}`)
            .max(question.max, `${question.label} must be at most ${question.max}`)
        : question.min !== undefined
          ? numberSchema.min(
              question.min,
              `${question.label} must be at least ${question.min}`
            )
          : question.max !== undefined
            ? numberSchema.max(
                question.max,
                `${question.label} must be at most ${question.max}`
              )
            : numberSchema;

    return z.preprocess((value) => {
      if (isBlank(value)) return undefined;
      return typeof value === "number" ? value : Number(value);
    }, required ? bounded : bounded.optional());
  }

  if (question.type === "radio" || question.type === "select") {
    const values = (question.options ?? []) as [string, ...string[]];
    const enumSchema = z.enum(values, {
      error: `${question.label} is required`,
    });

    if (required) return enumSchema;

    return z.preprocess(
      (value) => (isBlank(value) ? undefined : value),
      enumSchema.optional()
    );
  }

  if (question.format === "bd-phone") {
    const phoneSchema = z
      .string()
      .trim()
      .min(1, `${question.label} is required`)
      .refine(
        (value) =>
          value.length === 0 || BD_PHONE_REGEX.test(value),
        "Enter a valid Bangladeshi phone number (e.g. +8801712345678)"
      );

    return z.preprocess((value) => {
      if (required) {
        if (typeof value !== "string") return "";
        return normalizePhone(value);
      }
      if (typeof value !== "string") return undefined;
      const normalized = normalizePhone(value);
      return normalized === "" ? undefined : normalized;
    }, required ? phoneSchema : phoneSchema.optional());
  }

  let stringSchema = z.string().trim();

  if (question.type === "email") {
    stringSchema = stringSchema
      .min(1, `${question.label} is required`)
      .refine(
        (value) =>
          value.length === 0 ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Enter a valid email address"
      );
  } else if (required) {
    const minimum = question.minLength;
    stringSchema = stringSchema.superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `${question.label} is required`,
        });
      } else if (minimum !== undefined && value.length < minimum) {
        ctx.addIssue({
          code: "custom",
          message: `${question.label} must be at least ${minimum} characters`,
        });
      }
    });
  } else if (question.minLength !== undefined) {
    stringSchema = stringSchema.min(
      question.minLength,
      `${question.label} must be at least ${question.minLength} characters`
    );
  }

  if (question.maxLength !== undefined) {
    stringSchema = stringSchema.max(
      question.maxLength,
      `${question.label} must be at most ${question.maxLength} characters`
    );
  }

  if (required) {
    return z.preprocess(
      (value) => (typeof value === "string" ? value : ""),
      stringSchema
    );
  }

  return z.preprocess(
    (value) => (isBlank(value) ? undefined : value),
    stringSchema.optional()
  );
};

export const buildAnswersSchema = (survey: ISurvey) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const section of survey.sections) {
    for (const question of section.questions) {
      shape[question.key] = buildQuestionSchema(question);
    }
  }

  return z.object(shape);
};
