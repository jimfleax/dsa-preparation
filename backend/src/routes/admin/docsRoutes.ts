import express from "express";
import {
  getDocs,
  createDoc,
  deleteDoc,
} from "../../controllers/admin/docsController.js";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", requireAdminAuth, getDocs);
router.post("/", requireAdminAuth, createDoc);
router.delete("/:id", requireAdminAuth, deleteDoc);

export default router;
