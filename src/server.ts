import { createServer } from "http";
import app, { allowedOrigins } from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    console.log(`CORS allowed origin(s): ${allowedOrigins.join(", ")}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
