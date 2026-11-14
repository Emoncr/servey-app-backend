import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { signinSchema, signupSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", authLimiter, validate(signupSchema), authController.signup);
router.post("/signin", authLimiter, validate(signinSchema), authController.signin);
router.post("/signout", authController.signout);
router.get("/me", requireAuth, authController.me);

export default router;
