import { Router } from "express";
import { getTracks, createTrack, updateTrack, deleteTrack } from "../../controllers/admin/trackController";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware";

const router = Router();

router.use(requireAdminAuth);

router.get("/", getTracks);
router.post("/", createTrack);
router.put("/:id", updateTrack);
router.delete("/:id", deleteTrack);

export default router;
