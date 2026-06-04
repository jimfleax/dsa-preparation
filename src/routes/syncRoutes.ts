import { Router } from 'express';
import { syncSubmissions } from '../controllers/syncController.ts';

const router = Router();

// POST /api/sync — Trigger a LeetCode submission sync for the configured user
router.post('/', syncSubmissions);

export default router;
