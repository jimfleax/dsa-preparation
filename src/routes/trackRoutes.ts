import express from "express";
import { listTracks } from "../controllers/trackController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/tracks - Returns all curated tracks
// Protected by requireAuth to ensure only logged-in users access it
router.get("/", requireAuth, listTracks);

export default router;
