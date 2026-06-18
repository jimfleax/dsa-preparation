import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import trackRoutes from "./trackRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import docsRoutes from "./docsRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tracks", trackRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/docs", docsRoutes);

export default router;
