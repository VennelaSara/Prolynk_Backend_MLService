import express from "express";
const router = express.Router();

// Controller imports (ES module)
import { recommendServices } from "../controllers/recommendController.js";

// Recommendation route
router.post("/", recommendServices);

export default router;
