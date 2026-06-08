import { Router } from "express";
import {
  listProblems,
  listUntrackedProblems,
  addProblem,
  revisitProblem,
  deleteProblem,
  updateProblem,
  toggleTrackProblem,
} from "../controllers/problemController.ts";

const router = Router();

// GET /api/problems — List all tracked problems
router.get("/", listProblems);

// GET /api/problems/untracked — List all untracked problems
router.get("/untracked", listUntrackedProblems);

// POST /api/problems — Add a new solved problem
router.post("/", addProblem);

// PATCH /api/problems/:id/revisit — Record a revisit (increment count + update date)
router.patch("/:id/revisit", revisitProblem);

// PATCH /api/problems/:id/toggle-track — Toggle notrack status
router.patch("/:id/toggle-track", toggleTrackProblem);

// PUT /api/problems/:id — Update a problem (URL, attempts)
router.put("/:id", updateProblem);

// DELETE /api/problems/:id — Remove a problem
router.delete("/:id", deleteProblem);

export default router;
