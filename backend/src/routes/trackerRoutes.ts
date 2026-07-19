import { Router } from "express";
import {
  listProblems,
  listUntrackedProblems,
  addProblem,
  revisitProblem,
  deleteProblem,
  updateProblem,
  toggleTrackProblem,
  getTrackerMetrics,
  getSolvedSlugs,
  getDueProblems,
  getSlimProblems,
  revisitProblemBySlug,
  getProblemById,
} from "../controllers/trackerController.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import {
  listProblemsSchema,
  addProblemSchema,
  revisitProblemSchema,
  toggleTrackProblemSchema,
  revisitProblemBySlugSchema,
  updateProblemSchema,
  deleteProblemSchema,
} from "../lib/validations/tracker.ts";

const router = Router();

// GET /api/tracker/metrics - Get global metrics for tracker
router.get("/metrics", getTrackerMetrics);

// GET /api/tracker — List all tracked problems
router.get("/", validateRequest(listProblemsSchema), listProblems);

// GET /api/tracker/untracked — List all untracked problems
router.get("/untracked", listUntrackedProblems);

// GET /api/tracker/solved-slugs — Returns an array of slugs for tracked problems
router.get("/solved-slugs", getSolvedSlugs);

// GET /api/tracker/due — Returns problems due for review today or earlier
router.get("/due", getDueProblems);

// GET /api/tracker/slim — Returns a slimmed down version of all tracked problems
router.get("/slim", getSlimProblems);

// POST /api/tracker — Add a new solved problem
router.post("/", validateRequest(addProblemSchema), addProblem);

// PATCH /api/tracker/:id/revisit — Record a revisit (increment count + update date)
router.patch("/:id/revisit", validateRequest(revisitProblemSchema), revisitProblem);

// PATCH /api/tracker/:id/toggle-track — Toggle notrack status
router.patch("/:id/toggle-track", validateRequest(toggleTrackProblemSchema), toggleTrackProblem);

// PATCH /api/tracker/slug/:titleSlug/revisit — Record a revisit by title slug
router.patch("/slug/:titleSlug/revisit", validateRequest(revisitProblemBySlugSchema), revisitProblemBySlug);

// GET /api/tracker/:id — Get a single problem with full data (including notes)
router.get("/:id", getProblemById);

// PUT /api/tracker/:id — Update a problem (URL, attempts)
router.put("/:id", validateRequest(updateProblemSchema), updateProblem);

// DELETE /api/tracker/:id — Remove a problem
router.delete("/:id", validateRequest(deleteProblemSchema), deleteProblem);

export default router;
