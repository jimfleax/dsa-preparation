import { Router } from "express";
import { googleLogin } from "../controllers/authController.ts";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // limit each IP to 15 requests per window
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/google", authLimiter, googleLogin);

export default router;
