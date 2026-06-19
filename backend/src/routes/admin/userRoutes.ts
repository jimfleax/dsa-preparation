import { Router } from "express";
import { getUsers, deleteUser, getUserProgress, getLeetCodeData } from "../../controllers/admin/userController.js";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", getUsers);
router.get("/:id/progress", getUserProgress);
router.get("/:id/leetcode", getLeetCodeData);
router.delete("/:id", deleteUser);

export default router;
