import mongoose, { Document, Model, Schema } from "mongoose";
import type { SurveyAnswers } from "../utils/responseSummary";

export interface ISurveyResponse extends Document {
  surveySlug: string;
  answers: SurveyAnswers;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  address?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const responseSchema = new Schema<ISurveyResponse>(
  {
    surveySlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    answers: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "Anonymous",
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      default: 0,
    },
    gender: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 32,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    educationLevel: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
      index: true,
    },
    university: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    semester: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    currentStatus: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 180,
      default: "",
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    additionalComments: {
      type: String,
      trim: true,
      maxlength: 1200,
    },
    skillLevel: {
      type: String,
      trim: true,
      default: "Not specified",
    },
    interestedFields: {
      type: [String],
      default: [],
    },
    aiUsage: {
      type: String,
      trim: true,
      default: "Not specified",
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

responseSchema.index({ createdAt: -1 });
responseSchema.index({ surveySlug: 1, createdAt: -1 });
responseSchema.index({ educationLevel: 1, createdAt: -1 });

const SurveyResponse: Model<ISurveyResponse> =
  (mongoose.models.Response as Model<ISurveyResponse>) ||
  mongoose.model<ISurveyResponse>("Response", responseSchema);

export default SurveyResponse;
