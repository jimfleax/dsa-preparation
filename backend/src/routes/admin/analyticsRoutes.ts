import { Router } from "express";
import { getAnalytics } from "../../controllers/admin/analyticsController.js";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", getAnalytics);

export default router;
