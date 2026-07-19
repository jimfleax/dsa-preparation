import { Router } from "express";
import {
  getUserSettings,
  updateUserSettings,
} from "../controllers/userController.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import { updateUserSettingsSchema } from "../lib/validations/user.ts";

const router = Router();

// GET /api/user/settings — Retrieve current user's settings (auto-creates on first visit)
router.get("/settings", getUserSettings);

// POST /api/user/settings — Update current user's settings (e.g. leetcodeUsername)
router.post("/settings", validateRequest(updateUserSettingsSchema), updateUserSettings);

export default router;
