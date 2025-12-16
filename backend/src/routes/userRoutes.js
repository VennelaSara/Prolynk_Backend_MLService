import express from "express";
const router = express.Router();

// Middleware imports (ES module)
import { protect, authorize } from "../middleware/authMiddleware.js";

// Controller imports (ES module)
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

// Protected routes
router.use(protect);

// Current user profile
router.get("/me", (req, res) => res.json({ user: req.user }));

// Admin routes
router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id", authorize("admin", "customer", "merchant"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
