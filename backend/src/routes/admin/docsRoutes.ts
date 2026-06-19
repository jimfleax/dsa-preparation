import express from "express";
import {
  getDocs,
  createDoc,
  deleteDoc,
  updateDoc,
} from "../../controllers/admin/docsController.js";
import { requireAdminAuth } from "../../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", requireAdminAuth, getDocs);
router.post("/", requireAdminAuth, createDoc);
router.put("/:id", requireAdminAuth, updateDoc);
router.delete("/:id", requireAdminAuth, deleteDoc);

export default router;
