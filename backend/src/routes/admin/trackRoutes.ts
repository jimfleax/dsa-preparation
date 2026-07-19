import { Router } from "express";
import {
  getTracks,
  createTrack,
  updateTrack,
  deleteTrack,
} from "../../controllers/admin/trackController.js";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createTrackSchema, updateTrackSchema, getTrackSchema } from "../../lib/validations/track.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", getTracks);
router.post("/", validateRequest(createTrackSchema), createTrack);
router.put("/:id", validateRequest(updateTrackSchema), updateTrack);
router.delete("/:id", validateRequest(getTrackSchema), deleteTrack);

export default router;
