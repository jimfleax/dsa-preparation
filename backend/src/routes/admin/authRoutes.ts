import { Router } from "express";
import { adminGoogleLogin } from "../../controllers/admin/authController.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { googleLoginSchema } from "../../lib/validations/auth.js";

const router = Router();

router.post("/google", validateRequest(googleLoginSchema), adminGoogleLogin);

export default router;
