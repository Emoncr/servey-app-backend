import mongoose, { Document, Model, Schema } from "mongoose";

export const QUESTION_TYPES = [
  "text",
  "number",
  "email",
  "textarea",
  "radio",
  "select",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface ISurveyQuestion {
  key: string;
  label: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  format?: "bd-phone";
}

export interface ISurveySection {
  title: string;
  description: string;
  questions: ISurveyQuestion[];
}

export interface ISurvey extends Document {
  slug: string;
  title: string;
  description: string;
  language: string;
  sections: ISurveySection[];
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<ISurveyQuestion>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      match: [/^[a-zA-Z][a-zA-Z0-9]*$/, "Question keys must be camelCase"],
    },
    label: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, required: true, enum: QUESTION_TYPES },
    required: { type: Boolean, default: false },
    placeholder: { type: String, trim: true, maxlength: 200 },
    options: {
      type: [String],
      default: undefined,
      validate: {
        validator: (value: string[] | undefined) => !value || value.length > 1,
        message: "Choice questions need at least two options",
      },
    },
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    format: { type: String, enum: ["bd-phone"] },
  },
  { _id: false }
);

const sectionSchema = new Schema<ISurveySection>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (value: ISurveyQuestion[]) =>
          Array.isArray(value) && value.length > 0,
        message: "Each section needs at least one question",
      },
    },
  },
  { _id: false }
);

const surveySchema = new Schema<ISurvey>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid survey slug"],
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
    language: { type: String, required: true, trim: true, default: "English" },
    sections: {
      type: [sectionSchema],
      required: true,
      validate: {
        validator: (value: ISurveySection[]) =>
          Array.isArray(value) && value.length > 0,
        message: "A survey needs at least one section",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

surveySchema.pre("validate", function (next) {
  const keys = this.sections.flatMap((section) =>
    section.questions.map((question) => question.key)
  );

  if (new Set(keys).size !== keys.length) {
    this.invalidate("sections", "Question keys must be unique across the survey");
  }

  for (const section of this.sections) {
    for (const question of section.questions) {
      if (
        (question.type === "radio" || question.type === "select") &&
        (!question.options || question.options.length < 2)
      ) {
        this.invalidate(
          "sections",
          `Question "${question.key}" needs at least two options`
        );
      }
    }
  }

  next();
});

const Survey: Model<ISurvey> =
  (mongoose.models.Survey as Model<ISurvey>) ||
  mongoose.model<ISurvey>("Survey", surveySchema);

export default Survey;
