import { Router } from "express";
import * as surveyController from "../controllers/survey.controller";

const router = Router();

router.get("/:slug", surveyController.getSurvey);

export default router;
