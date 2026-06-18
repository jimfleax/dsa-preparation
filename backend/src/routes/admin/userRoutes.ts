import { Router } from "express";
import { getUsers } from "../../controllers/admin/userController.js";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", getUsers);

export default router;
