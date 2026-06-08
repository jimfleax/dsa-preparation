import { Router } from 'express';
import { checkSync, trackSubmissions } from '../controllers/syncController.ts';

const router = Router();

// GET /api/sync/check — Check for new accepted submissions on LeetCode
router.get('/check', checkSync);

// POST /api/sync/track — Track or dismiss new submissions
router.post('/track', trackSubmissions);

export default router;
