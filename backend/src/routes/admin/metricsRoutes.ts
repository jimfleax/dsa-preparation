import { Router } from "express";
import { getMetrics } from "../../controllers/admin/metricsController.js";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware.js";

const router = Router();

router.get("/", requireAdminAuth, getMetrics);

export default router;
