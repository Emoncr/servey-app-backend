import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { isProduction } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import apiRoutes from "./routes";
import { ApiError } from "./utils/ApiError";

export const allowedOrigins = [
  "http://localhost:3000",
  "https://student-servey-app.vercel.app",
];

export const createApp = (): Express => {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const normalizedOrigin = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new ApiError(403, `Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use(cookieParser());

  if (!isProduction) {
    app.use(morgan("dev"));
  }

  app.use("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", apiRoutes);
  app.use(apiRoutes); // Fallback if frontend makes request without '/api'

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;
