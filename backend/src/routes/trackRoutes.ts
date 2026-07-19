import { Router } from "express";
import { listTracks, getTrackMetrics } from "../controllers/trackController.ts";
import { requireAuth } from "../middleware/authMiddleware.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import { listTracksSchema } from "../lib/validations/track.ts";

const router = Router();

// GET /api/tracks/metrics - Returns global track metrics
router.get("/metrics", requireAuth, getTrackMetrics);

// GET /api/tracks - Returns all curated tracks
// Protected by requireAuth to ensure only logged-in users access it
router.get("/", requireAuth, validateRequest(listTracksSchema), listTracks);

export default router;
