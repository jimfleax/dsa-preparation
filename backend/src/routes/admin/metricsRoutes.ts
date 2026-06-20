import { Router } from "express";
import { getMetrics } from "../../controllers/admin/metricsController";

const router = Router();

router.get("/", getMetrics);

export default router;
