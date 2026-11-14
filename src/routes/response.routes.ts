import { Router } from "express";
import * as responseController from "../controllers/response.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { publicSubmitLimiter } from "../middlewares/rateLimit.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createResponseSchema,
  responseIdSchema,
  responseQuerySchema,
  updateResponseSchema,
} from "../schemas/response.schema";

const router = Router();

router.post(
  "/",
  publicSubmitLimiter,
  validate(createResponseSchema),
  responseController.createResponse
);

router.use(requireAuth);

router.get(
  "/export/csv",
  responseController.exportCsv
);

router.get(
  "/",
  validateQuery(responseQuerySchema),
  responseController.listResponses
);

router.get(
  "/:id",
  validateParams(responseIdSchema),
  responseController.getResponse
);

router.put(
  "/:id",
  validateParams(responseIdSchema),
  validate(updateResponseSchema),
  responseController.updateResponse
);

router.delete(
  "/:id",
  validateParams(responseIdSchema),
  responseController.deleteResponse
);

export default router;
