import { Router } from "express";
import authRoutes from "./auth.routes";
import responseRoutes from "./response.routes";
import statsRoutes from "./stats.routes";
import surveyRoutes from "./survey.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});

router.use("/auth", authRoutes);
router.use("/surveys", surveyRoutes);
router.use("/responses", responseRoutes);
router.use("/stats", statsRoutes);

export default router;
