import { Router } from 'express';
import { listProblems, addProblem, toggleSolved, deleteProblem } from '../controllers/problemController.ts';

const router = Router();

// GET /api/problems — List all tracked problems with optional filtering
router.get('/', listProblems);

// POST /api/problems — Add a new problem by LeetCode URL
router.post('/', addProblem);

// PATCH /api/problems/:id/solve — Toggle solved/unsolved status
router.patch('/:id/solve', toggleSolved);

// DELETE /api/problems/:id — Remove a problem from tracker
router.delete('/:id', deleteProblem);

export default router;
