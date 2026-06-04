import { Router } from 'express';
import { listProblems, addProblem } from '../controllers/problemController.ts';

const router = Router();

// GET /api/problems — List all tracked problems with optional filtering
router.get('/', listProblems);

// POST /api/problems — Add a new problem by LeetCode URL
router.post('/', addProblem);

export default router;
