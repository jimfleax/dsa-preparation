import { Router } from "express";
import { getDocuments, getDocument } from "../controllers/documentController.ts";

const router = Router();

// GET /api/documents - Retrieve all listed documents
router.get("/documents", getDocuments);

// GET /api/document - Fetch details/content of a single document
router.get("/document", getDocument);

export default router;
