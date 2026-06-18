import { Router } from "express";
import { getUsers } from "../../controllers/admin/userController";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware";

const router = Router();

router.get("/", requireAdminAuth, getUsers);

export default router;
