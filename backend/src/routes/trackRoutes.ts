import express from "express";
import { listTracks, getTrackMetrics } from "../controllers/trackController.ts";
import { requireAuth } from "../middleware/authMiddleware.ts";

const router = express.Router();

// GET /api/tracks/metrics - Returns global track metrics
router.get("/metrics", requireAuth, getTrackMetrics);

// GET /api/tracks - Returns all curated tracks
// Protected by requireAuth to ensure only logged-in users access it
router.get("/", requireAuth, listTracks);

export default router;
