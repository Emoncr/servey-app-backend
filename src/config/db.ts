import mongoose from "mongoose";
import { env } from "./env";

mongoose.set("strictQuery", true);

export const connectDB = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MongoDB connection failed: ${message}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};
