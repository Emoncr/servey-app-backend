export type SurveyAnswers = Record<string, unknown>;

export interface ResponseSummary {
  surveySlug: string;
  answers: SurveyAnswers;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  educationLevel: string;
  university: string;
  department: string;
  semester: string;
  currentStatus: string;
  email: string;
  occupation?: string;
  additionalComments?: string;
  skillLevel: string;
  interestedFields: string[];
  aiUsage: string;
}

const asText = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

const asOptionalText = (value: unknown): string | undefined => {
  const text = asText(value);
  return text === "" ? undefined : text;
};

const asNumber = (value: unknown): number => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const buildResponseSummary = (
  surveySlug: string,
  answers: SurveyAnswers
): ResponseSummary => {
  const currentStatus = asText(answers.currentStatus);
  const occupation = asOptionalText(answers.occupation);

  return {
    surveySlug,
    answers,
    fullName: asText(answers.fullName) || "Anonymous",
    age: asNumber(answers.age),
    gender: asText(answers.gender),
    phone:
      asText(answers.contactNumber) ||
      asText(answers.phone),
    address: asText(answers.address),
    educationLevel: asText(answers.educationLevel),
    university: asText(answers.university),
    department: asText(answers.department),
    semester: currentStatus,
    currentStatus,
    email: asText(answers.email),
    occupation,
    additionalComments: asOptionalText(answers.comments),
    skillLevel: "Not specified",
    interestedFields: occupation ? [occupation] : [],
    aiUsage: "Not specified",
  };
};
