import express from "express";
const router = express.Router();

// Middleware imports (ES module)
import { protect, authorize } from "../middleware/authMiddleware.js";

// Controller imports (ES module)
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  addRating,
} from "../controllers/serviceController.js";

// ---------------- PUBLIC ----------------
router.get("/", getServices);
router.get("/:id", getServiceById);

// ---------------- MERCHANT ----------------
router.post("/", protect, authorize("merchant"), createService);
router.put("/:id", protect, authorize("merchant"), updateService);
router.delete("/:id", protect, authorize("merchant", "admin"), deleteService);

// ---------------- CUSTOMER ----------------
router.post("/:id/rate", protect, authorize("customer"), addRating);

export default router;
