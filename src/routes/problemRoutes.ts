import { Router } from 'express';
import { listProblems, addProblem, revisitProblem, deleteProblem, updateProblem } from '../controllers/problemController.ts';

const router = Router();

// GET /api/problems — List all tracked problems
router.get('/', listProblems);

// POST /api/problems — Add a new solved problem
router.post('/', addProblem);

// PATCH /api/problems/:id/revisit — Record a revisit (increment count + update date)
router.patch('/:id/revisit', revisitProblem);

// PUT /api/problems/:id — Update a problem (URL, attempts)
router.put('/:id', updateProblem);

// DELETE /api/problems/:id — Remove a problem
router.delete('/:id', deleteProblem);

export default router;
