import { Router } from "express";
import { adminLogin, adminGoogleLogin } from "../../controllers/admin/authController.js";

const router = Router();

router.post("/login", adminLogin);
router.post("/google", adminGoogleLogin);

export default router;
