import { Router } from 'express';
import { syncLeetCode } from '../controllers/syncController.ts';

const router = Router();

// POST /api/sync — Trigger LeetCode data sync for the authenticated user
router.post('/', syncLeetCode);

export default router;
