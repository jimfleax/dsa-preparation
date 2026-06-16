import { Router } from "express";
import {
  listProblems,
  listUntrackedProblems,
  addProblem,
  revisitProblem,
  deleteProblem,
  updateProblem,
  toggleTrackProblem,
  updateNotes,
} from "../controllers/trackerController.ts";

const router = Router();

// GET /api/tracker — List all tracked problems
router.get("/", listProblems);

// GET /api/tracker/untracked — List all untracked problems
router.get("/untracked", listUntrackedProblems);

// POST /api/tracker — Add a new solved problem
router.post("/", addProblem);

// PATCH /api/tracker/:id/revisit — Record a revisit (increment count + update date)
router.patch("/:id/revisit", revisitProblem);

// PATCH /api/tracker/:id/toggle-track — Toggle notrack status
router.patch("/:id/toggle-track", toggleTrackProblem);

// PUT /api/tracker/:id — Update a problem (URL, attempts)
router.put("/:id", updateProblem);

// DELETE /api/tracker/:id — Remove a problem
router.delete("/:id", deleteProblem);

// PATCH /api/tracker/:id/notes — Update notes for a problem
router.patch("/:id/notes", updateNotes);

export default router;
