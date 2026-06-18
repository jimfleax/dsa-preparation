import { Router } from "express";
import { adminGoogleLogin } from "../../controllers/admin/authController.js";

const router = Router();


router.post("/google", adminGoogleLogin);

export default router;
