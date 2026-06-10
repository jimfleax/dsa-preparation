import { Router } from "express";
import {
  getUserSettings,
  updateUserSettings,
} from "../controllers/userController.ts";

const router = Router();

// GET /api/user/settings — Retrieve current user's settings (auto-creates on first visit)
router.get("/settings", getUserSettings);

// POST /api/user/settings — Update current user's settings (e.g. leetcodeUsername)
router.post("/settings", updateUserSettings);

export default router;
