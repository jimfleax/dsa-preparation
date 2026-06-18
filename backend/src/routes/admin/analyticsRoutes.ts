import { Router } from "express";
import { getAnalytics } from "../../controllers/admin/analyticsController";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware";

const router = Router();

router.get("/", requireAdminAuth, getAnalytics);

export default router;
