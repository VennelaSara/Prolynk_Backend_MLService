import express from "express";
const router = express.Router();

// Controller imports (ES module)
import { register, login } from "../controllers/authController.js";

// Auth routes
router.post("/register", register);
router.post("/login", login);

export default router;
