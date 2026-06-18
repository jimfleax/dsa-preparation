import { Router } from "express";
import { googleLogin } from "../controllers/authController.ts";

const router = Router();

router.post("/google", googleLogin);

export default router;
