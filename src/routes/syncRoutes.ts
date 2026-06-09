import { Router } from "express";
import rateLimit from "express-rate-limit";
import { checkSync, trackSubmissions } from "../controllers/syncController.ts";

const router = Router();

const syncLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window`
  message: { success: false, error: "Too many sync requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/sync/check — Check for new accepted submissions on LeetCode
router.get("/check", syncLimiter, checkSync);

// POST /api/sync/track — Track or dismiss new submissions
router.post("/track", trackSubmissions);

export default router;
