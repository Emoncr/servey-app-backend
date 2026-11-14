import { Router } from "express";
import * as statsController from "../controllers/stats.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, statsController.getStats);

export default router;
